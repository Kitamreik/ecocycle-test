const { supabase } = require('../config/supabase');

const getRequests = async (req, res) => {
    try {
        const { data: requestsData, error: requestsError } = await supabase
            .from('requests')
            .select(`
                rid,
                rsid,
                rcontactname,
                rcontactemail,
                rcontactphone,
                rcontactptype,
                rcontactbesttimes,
                requeststatuses (
                    requeststatusname
                ),
                rcommunication,
                rnotes,
                created_at,
                updated_at,
                schools (
                    sname
                ),
                trainingsessions (
                    tsid,
                    tspid,
                    tsfid,
                    userid,
                    tsgrades,
                    tsstarttime,
                    tsendtime,
                    tsstudents,
                    tsclassrooms,
                    tsadults,
                    tsdate,
                    tseducators,
                    users (
                        username
                    ),
                    presentations (
                        pname
                    ),
                    funding (
                        fname
                    )
                )
            `)
            .order('created_at', { ascending: false });


        if (requestsError) throw requestsError;

        const formattedRequestsData = requestsData.map(request => ({
            ...request,
            schoolName: request.schools?.sname || null,
            statusName: request.requeststatuses?.requeststatusname || null,
            trainingsessions: request.trainingsessions?.map(session => ({
                ...session,
                educatorName: session.users?.username || null,
                presentationName: session.presentations?.pname || null,
                fundingName: session.funding?.fname || null
            })) || []
        }));


        res.render('pages/admin-dashboard/requests/view', {
            requests: formattedRequestsData || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching requests data:', error);
        res.render('pages/admin-dashboard/requests/view', {
            requests: [],
            error: 'Error retrieving requests data'
        });
    }
};

// Render add request form without phone types
const addRequestForm = async (req, res) => {
    try {
        const [schoolsResponse, statusesResponse] = await Promise.all([
            supabase.from('schools').select('sid, sname').order('sname'),
            supabase.from('requeststatuses').select('requeststatusid, requeststatusname').order('requeststatusname')
        ]);

        if (schoolsResponse.error) throw schoolsResponse.error;
        if (statusesResponse.error) throw statusesResponse.error;

        res.render('pages/admin-dashboard/requests/add', {
            schools: schoolsResponse.data,
            statuses: statusesResponse.data,
            error: null
        });
    } catch (error) {
        res.render('pages/admin-dashboard/requests/add', {
            schools: [],
            statuses: [],
            error: 'Error loading form data'
        });
    }
};

// Edit request form
const editRequestForm = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).render('pages/admin-dashboard/requests/edit', {
                error: 'Invalid request ID',
                request: null,
                schools: [],
                statuses: []
            });
        }

        // Fetch request data and all required dropdown data
        const [requestResponse, schoolsResponse, statusesResponse] = await Promise.all([
            supabase.from('requests').select('*').eq('rid', requestId).single(),
            supabase.from('schools').select('sid, sname').order('sname'),
            supabase.from('requeststatuses').select('requeststatusid, requeststatusname').order('requeststatusname')
        ]);

        if (requestResponse.error) throw requestResponse.error;
        if (schoolsResponse.error) throw schoolsResponse.error;
        if (statusesResponse.error) throw statusesResponse.error;

        if (!requestResponse.data) {
            return res.render('pages/admin-dashboard/requests/edit', {
                error: 'Request not found',
                request: null,
                schools: [],
                statuses: []
            });
        }
        
        res.render('pages/admin-dashboard/requests/edit', {
            request: requestResponse.data,
            schools: schoolsResponse.data,
            statuses: statusesResponse.data,
            error: null
        });
    } catch (error) {
        res.render('pages/admin-dashboard/requests/edit', {
            error: 'Error retrieving request data',
            request: null,
            schools: [],
            statuses: []
        });
    }
};

// Update request
const updateRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const {
            rsid,
            rcontactname,
            rcontactemail,
            rcontactphone,
            rcontactptype,
            rcontactbesttimes,
            rstatusid,
            rcommunication,
            rnotes
        } = req.body;

        // Input validation
        if (!rcontactname || typeof rcontactname !== 'string') {
            return res.status(400).json({
                error: 'Contact name is required and must be a string'
            });
        }

        const trimmedName = rcontactname.trim();
        if (trimmedName.length < 2 || trimmedName.length > 35) {
            return res.status(400).json({
                error: 'Contact name must be between 2 and 35 characters'
            });
        }

        // Email validation
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
        if (!rcontactemail || !emailRegex.test(rcontactemail)) {
            return res.status(400).json({
                error: 'Valid email address is required'
            });
        }

        // Phone validation if provided
        if (rcontactphone && !/^[0-9]{10}$/.test(rcontactphone)) {
            return res.status(400).json({
                error: 'Phone number must be 10 digits'
            });
        }

        const { data, error } = await supabase
            .from('requests')
            .update({
                rsid,
                rcontactname: trimmedName,
                rcontactemail,
                rcontactphone,
                rcontactptype: rcontactptype || null,
                rcontactbesttimes,
                rstatusid,
                rcommunication,
                rnotes,
                updated_at: new Date()
            })
            .eq('rid', requestId)
            .select();

        if (error) throw error;

        res.json({
            message: 'Request updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({
            error: 'Failed to update request'
        });
    }
};

// Add a new request
const addRequest = async (req, res) => {
    try {
        const {
            rsid,
            rcontactname,
            rcontactemail,
            rcontactphone,
            rcontactptype,
            rcontactbesttimes,
            rstatusid,
            rcommunication,
            rnotes
        } = req.body;

        // Input validation
        if (!rcontactname || typeof rcontactname !== 'string') {
            return res.status(400).json({
                error: 'Contact name is required and must be a string'
            });
        }

        const trimmedName = rcontactname.trim();
        if (trimmedName.length < 2 || trimmedName.length > 35) {
            return res.status(400).json({
                error: 'Contact name must be between 2 and 35 characters'
            });
        }

        // Email validation
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
        if (!rcontactemail || !emailRegex.test(rcontactemail)) {
            return res.status(400).json({
                error: 'Valid email address is required'
            });
        }

        // Phone validation if provided
        if (rcontactphone && !/^[0-9]{10}$/.test(rcontactphone)) {
            return res.status(400).json({
                error: 'Phone number must be 10 digits'
            });
        }

        const { data, error } = await supabase
            .from('requests')
            .insert([{
                rsid,
                rcontactname: trimmedName,
                rcontactemail,
                rcontactphone,
                rcontactptype: rcontactptype || null, // Handle null case for phone type
                rcontactbesttimes,
                rstatusid,
                rcommunication,
                rnotes
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: 'Request added successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error adding new request:', error);
        res.status(500).json({
            error: 'Failed to add request'
        });
    }
};

// Delete request
const deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).json({
                error: 'Invalid request ID'
            });
        }

        // Check if request exists before deletion
        const { data: existingRequest, error: checkError } = await supabase
            .from('requests')
            .select('rid')
            .eq('rid', requestId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (!existingRequest) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }

        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('rid', requestId);

        if (error) throw error;

        res.json({
            message: 'Request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({
            error: 'Failed to delete request'
        });
    }
};

module.exports = {
    getRequests,
    addRequestForm,
    addRequest,
    editRequestForm,
    updateRequest,
    deleteRequest
};
