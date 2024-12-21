const { supabase } = require('../config/supabase');

// Fetch all training sessions
const getTrainingSessions = async (req, res) => {
    try {
        const { data: trainingsessionsdata, error: trainingsessionserror } = await supabase
            .from('trainingsessions')
            .select(`
                tsid,
                tsrid,
                tssid,
                tspid,
                tsfid,
                userid,
                tsgrades,
                tsdate,
                tsstarttime,
                tsendtime,
                tsstudents,
                tsclassrooms,
                tsadults,
                tsstatusid,
                created_at,
                updated_at,
                schools (
                    sid,
                    sname
                ),
                presentations (
                    pid,
                    pname
                ),
                funding (
                    fid,
                    fname
                ),
                users (
                    userid,
                    username
                ),
                sessionstatuses (
                    sessionstatusid,
                    sessionstatusname
                )
            `)
            .order('created_at', { ascending: false });

        if (trainingsessionserror) throw trainingsessionserror;

        const formattedSessionsData = trainingsessionsdata.map(session => ({
            ...session,
            schoolName: session.schools?.sname || null,
            presentationName: session.presentations?.pname || null,
            fundingName: session.funding?.fname || null,
            educatorName: session.users?.username || null,
            statusName: session.sessionstatuses?.sessionstatusname || null
        }));

        res.render('pages/admin-dashboard/training-sessions/view', {
            trainingsessions: formattedSessionsData || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching training sessions data:', error);
        res.render('pages/admin-dashboard/training-sessions/view', {
            trainingsessions: [],
            error: 'Error retrieving training sessions data'
        });
    }
};

const addTrainingSessionForm = async (req, res) => {
    try {
        // Get the request ID from query params if it exists
        const rid = req.query.rid ? parseInt(req.query.rid) : null;
        console.log('Request ID from query:', rid, typeof rid);

        // Fetch all required data for dropdowns
        const [
            requestsResponse,
            presentationsResponse,
            fundingResponse,
            educatorsResponse,
            statusesResponse
        ] = await Promise.all([
            supabase.from('requests')
                .select(`
                    rid,
                    schools (
                        sid,
                        sname
                    )
                `)
                .order('rid'),
            supabase.from('presentations').select('pid, pname').order('pname'),
            supabase.from('funding').select('fid, fname').order('fname'),
            supabase.from('users').select('userid, username').order('username'),
            supabase.from('sessionstatuses').select('sessionstatusid, sessionstatusname').order('sessionstatusname')
        ]);

        res.render('pages/admin-dashboard/training-sessions/add', {
            selectedRequestId: rid || null,  // Pass the pre-selected request ID
            requests: requestsResponse.data || [],
            presentations: presentationsResponse.data || [],
            funding: fundingResponse.data || [],
            educators: educatorsResponse.data || [],
            statuses: statusesResponse.data || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching data for add training session form:', error);
        res.render('pages/admin-dashboard/training-sessions/add', {
            selectedRequestId: null,
            requests: [],
            presentations: [],
            funding: [],
            educators: [],
            statuses: [],
            error: 'Error loading form data'
        });
    }
};

// Regular add training session (full info)
// Regular add training session (full info)
const addTrainingSession = async (req, res) => {
    try {
        const {
            rid,            // Required
            pid,            // Optional
            fid,            // Optional
            userid,         // Optional
            tsgrades,       // Optional
            tsscheduleddatetime,        // Optional
            tspreferreddatetimestart,   // Optional
            tspreferreddatetimeend,     // Optional
            tsstudents,     // Optional
            tsclassrooms,   // Optional
            tsadults,       // Optional
            tsstatusid = 2  // Optional, defaults to 1
        } = req.body;

        if (!rid) {
            return res.status(400).json({
                error: 'Request ID is required'
            });
        }

        // Create data object with only the required field first
        const sessionData = {
            rid,
            tsstatusid
        };

        // Add optional fields only if they have valid values
        if (pid) sessionData.pid = pid;
        if (fid) sessionData.fid = fid;
        if (userid) sessionData.userid = userid;
        if (tsgrades) sessionData.tsgrades = tsgrades;

        // Handle timestamps - only add if they have values
        if (tsscheduleddatetime && tsscheduleddatetime.trim() !== '') {
            sessionData.tsscheduleddatetime = tsscheduleddatetime;
        }
        if (tspreferreddatetimestart && tspreferreddatetimestart.trim() !== '') {
            sessionData.tspreferreddatetimestart = tspreferreddatetimestart;
        }
        if (tspreferreddatetimeend && tspreferreddatetimeend.trim() !== '') {
            sessionData.tspreferreddatetimeend = tspreferreddatetimeend;
        }

        // Validate dates if both are provided
        if (sessionData.tspreferreddatetimestart && sessionData.tspreferreddatetimeend) {
            if (new Date(sessionData.tspreferreddatetimestart) > new Date(sessionData.tspreferreddatetimeend)) {
                return res.status(400).json({
                    error: 'Preferred start time must be before end time'
                });
            }
        }

        // Handle numeric fields - set to 0 or the provided value
        sessionData.tsstudents = tsstudents || 0;
        sessionData.tsclassrooms = tsclassrooms || 0;
        sessionData.tsadults = tsadults || 0;

        const { data, error } = await supabase
            .from('trainingsessions')
            .insert([sessionData])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: 'Training session added successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error adding new training session:', error);
        res.status(500).json({
            error: 'Failed to add training session'
        });
    }
};

const editTrainingSessionForm = async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('Requested Session ID:', sessionId);

        if (!sessionId || isNaN(sessionId)) {
            console.log('Invalid session ID provided');
            return res.render('pages/admin-dashboard/training-sessions/edit', {
                error: 'Invalid session ID',
                trainingsession: null,
                requests: [],
                presentations: [],
                funding: [],
                educators: [],
                statuses: []
            });
        }

        // First fetch the training session with related data
        const { data: sessionData, error: sessionError } = await supabase
            .from('trainingsessions')
            .select(`
                *,
                requests (
                    rid,
                    schools (
                        sid,
                        sname
                    )
                ),
                presentations (
                    pid,
                    pname
                ),
                funding (
                    fid,
                    fname
                ),
                users (
                    userid,
                    username
                )
            `)
            .eq('tsid', sessionId)
            .single();

        console.log('Session Data:', sessionData);
        console.log('Session Error:', sessionError);

        if (sessionError || !sessionData) {
            console.log('No session found or error occurred');
            return res.render('pages/admin-dashboard/training-sessions/edit', {
                error: sessionError ? sessionError.message : 'Training session not found',
                trainingsession: null,
                requests: [],
                presentations: [],
                funding: [],
                educators: [],
                statuses: []
            });
        }

        // Fetch dropdown data
        const [
            requestsResponse,
            presentationsResponse,
            fundingResponse,
            educatorsResponse,
            statusesResponse
        ] = await Promise.all([
            supabase.from('requests').select('rid, schools(sname)').order('rid'),
            supabase.from('presentations').select('pid, pname').order('pname'),
            supabase.from('funding').select('fid, fname').order('fname'),
            supabase.from('users').select('userid, username').order('username'),
            supabase.from('sessionstatuses').select('sessionstatusid, sessionstatusname').order('sessionstatusname')
        ]);

        // Log responses for debugging
        console.log('Requests Response:', requestsResponse);
        console.log('Status Response:', statusesResponse);

        // Check if we have valid data for dropdowns
        if (requestsResponse.error || presentationsResponse.error ||
            fundingResponse.error || educatorsResponse.error || statusesResponse.error) {
            console.log('Error fetching dropdown data');
            return res.render('pages/admin-dashboard/training-sessions/edit', {
                error: 'Error loading form data',
                trainingsession: null,
                requests: [],
                presentations: [],
                funding: [],
                educators: [],
                statuses: []
            });
        }

        res.render('pages/admin-dashboard/training-sessions/edit', {
            error: null,
            trainingsession: sessionData,
            requests: requestsResponse.data || [],
            presentations: presentationsResponse.data || [],
            funding: fundingResponse.data || [],
            educators: educatorsResponse.data || [],
            statuses: statusesResponse.data || []
        });
    } catch (error) {
        console.error('Error fetching training session data for edit:', error);
        res.render('pages/admin-dashboard/training-sessions/edit', {
            error: 'Error retrieving training session data',
            trainingsession: null,
            requests: [],
            presentations: [],
            funding: [],
            educators: [],
            statuses: []
        });
    }
};

// Update training session
const updateTrainingSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const {
            rid,            // Required
            pid,            // Optional
            fid,            // Optional
            userid,         // Optional
            tsgrades,       // Optional
            tsscheduleddatetime,        // Optional
            tspreferreddatetimestart,   // Optional
            tspreferreddatetimeend,     // Optional
            tsstudents,     // Optional
            tsclassrooms,   // Optional
            tsadults,       // Optional
            tsstatusid = 2  // Optional, defaults to 1
        } = req.body;

        if (!rid) {
            return res.status(400).json({
                error: 'Request ID is required'
            });
        }

        // Create update object with only the required field first
        const updateData = {
            rid,
            tsstatusid,
            updated_at: new Date()
        };

        // Add optional fields only if they have valid values
        if (pid) updateData.pid = pid;
        if (fid) updateData.fid = fid;
        if (userid) updateData.userid = userid;
        if (tsgrades) updateData.tsgrades = tsgrades;

        // Handle timestamps - only update if they have values
        if (tsscheduleddatetime && tsscheduleddatetime.trim() !== '') {
            updateData.tsscheduleddatetime = tsscheduleddatetime;
        }
        if (tspreferreddatetimestart && tspreferreddatetimestart.trim() !== '') {
            updateData.tspreferreddatetimestart = tspreferreddatetimestart;
        }
        if (tspreferreddatetimeend && tspreferreddatetimeend.trim() !== '') {
            updateData.tspreferreddatetimeend = tspreferreddatetimeend;
        }

        // Validate dates if both are provided
        if (updateData.tspreferreddatetimestart && updateData.tspreferreddatetimeend) {
            if (new Date(updateData.tspreferreddatetimestart) > new Date(updateData.tspreferreddatetimeend)) {
                return res.status(400).json({
                    error: 'Preferred start time must be before end time'
                });
            }
        }

        // Handle numeric fields
        updateData.tsstudents = tsstudents || 0;
        updateData.tsclassrooms = tsclassrooms || 0;
        updateData.tsadults = tsadults || 0;

        const { data, error } = await supabase
            .from('trainingsessions')
            .update(updateData)
            .eq('tsid', sessionId)
            .select();

        if (error) throw error;

        res.json({
            message: 'Training session updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating training session:', error);
        res.status(500).json({
            error: 'Failed to update training session'
        });
    }
};

// Delete training session
const deleteTrainingSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId || isNaN(sessionId)) {
            return res.status(400).json({
                error: 'Invalid session ID'
            });
        }

        // Check if session exists before deletion
        const { data: existingSession, error: checkError } = await supabase
            .from('trainingsessions')
            .select('tsid')
            .eq('tsid', sessionId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (!existingSession) {
            return res.status(404).json({
                error: 'Training session not found'
            });
        }

        const { error } = await supabase
            .from('trainingsessions')
            .delete()
            .eq('tsid', sessionId);

        if (error) throw error;

        res.json({
            message: 'Training session deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting training session:', error);
        res.status(500).json({
            error: 'Failed to delete training session'
        });
    }
};

module.exports = {
    getTrainingSessions,
    addTrainingSessionForm,
    addTrainingSession,
    editTrainingSessionForm,
    updateTrainingSession,
    deleteTrainingSession
};