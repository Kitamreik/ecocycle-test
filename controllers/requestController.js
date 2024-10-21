const { supabase } = require('../config/supabase');

// Fetch all requests
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
                rstatusid,
                rcommunication,
                rnotes,
                created_at,
                updated_at
            `);

        if (requestsError) throw requestsError;
        res.render('pages/admin-dashboard/requests', { requests: requestsData || [] });
    } catch (error) {
        console.error('Error fetching requests data:', error);
        res.status(500).json({ error: 'Error retrieving data from Supabase' });
    }
};

// Add a new request
const addRequestForm = async (req, res) => {
    try {
        const { data: schools, error: schoolsError } = await supabase.from('schools').select('sid, sname');
        const { data: statuses, error: statusesError } = await supabase.from('requeststatuses').select('requeststatusid, requeststatusname');

        if (schoolsError) throw schoolsError;
        if (statusesError) throw statusesError;

        res.json({ schools, statuses });
    } catch (error) {
        console.error('Error fetching data for add request form:', error);
        res.status(500).json({ error: 'Error retrieving data from Supabase' });
    }
};

const addRequest = async (req, res) => {
    try {
        const { rsid, rcontactname, rcontactemail, rcontactphone, rcontactptype, rcontactbesttimes, rstatusid, rcommunication, rnotes } = req.body;

        const { data, error } = await supabase
            .from('requests')
            .insert([{ rsid, rcontactname, rcontactemail, rcontactphone, rcontactptype, rcontactbesttimes, rstatusid, rcommunication, rnotes }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Request added successfully', data });
    } catch (error) {
        console.error('Error adding new request:', error);
        res.status(500).json({ error: 'Error adding new request to Supabase' });
    }
};

// Edit request
const editRequestForm = async (req, res) => {
    try {
        const { data: requestData, error: requestError } = await supabase
            .from('requests')
            .select('*')
            .eq('rid', req.params.requestId)
            .single();

        if (requestError) throw requestError;

        if (!requestData) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const { data: schools, error: schoolsError } = await supabase.from('schools').select('sid, sname');
        const { data: statuses, error: statusesError } = await supabase.from('requeststatuses').select('requeststatusid, requeststatusname');

        if (schoolsError) throw schoolsError;
        if (statusesError) throw statusesError;

        res.json({ request: requestData, schools, statuses });
    } catch (error) {
        console.error('Error fetching request data for edit:', error);
        res.status(500).json({ error: 'Error retrieving request data from Supabase' });
    }
};

// Update request
const updateRequest = async (req, res) => {
    try {
        const { rsid, rcontactname, rcontactemail, rcontactphone, rcontactptype, rcontactbesttimes, rstatusid, rcommunication, rnotes } = req.body;

        const { data, error } = await supabase
            .from('requests')
            .update({ rsid, rcontactname, rcontactemail, rcontactphone, rcontactptype, rcontactbesttimes, rstatusid, rcommunication, rnotes, updated_at: new Date() })
            .eq('rid', req.params.requestId)
            .select();

        if (error) throw error;

        res.json({ message: 'Request updated successfully', data });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: 'Error updating request in Supabase' });
    }
};

// Delete request
const deleteRequest = async (req, res) => {
    try {
        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('rid', req.params.requestId);

        if (error) throw error;

        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ error: 'Error deleting request from Supabase' });
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