const { supabase } = require('../config/supabase');

// Fetch all training sessions
const getTrainingSessions = async (req, res) => {
    try {
        const { data: trainingsessionsdata, error: trainingsessionserror } = await supabase
            .from('trainingsessions')
            .select(`
                tsid,
                rid,
                pid,
                fid,
                userid,
                tsgrades,
                tsscheduleddatetime,
                tspreferreddatetimestart,
                tspreferreddatetimeend,
                tsstudents,
                tsclassrooms,
                tsadults,
                tsstatusid,
                created_at,
                updated_at,
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
                ),
                sessionstatuses (
                    sessionstatusid,
                    statusname
                )
            `)
            .order('created_at', { ascending: false });

        if (trainingsessionserror) throw trainingsessionserror;

        const formattedSessionsData = trainingsessionsdata.map(session => ({
            ...session,
            schoolName: session.requests?.schools?.sname || null,
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
        const { rid } = req.query;

        // Fetch all required data for dropdowns
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
            supabase.from('sessionstatuses').select('sessionstatusid, statusname').order('statusname')
        ]);

        if (requestsResponse.error) throw requestsResponse.error;
        if (presentationsResponse.error) throw presentationsResponse.error;
        if (fundingResponse.error) throw fundingResponse.error;
        if (educatorsResponse.error) throw educatorsResponse.error;
        if (statusesResponse.error) throw statusesResponse.error;

        res.render('pages/admin-dashboard/training-sessions/add', {
            selectedRequestId: rid || null,  // Pass the pre-selected request ID
            requests: requestsResponse.data,
            presentations: presentationsResponse.data,
            funding: fundingResponse.data,
            educators: educatorsResponse.data,
            statuses: statusesResponse.data,
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
            tsstatusid = 1  // Optional, defaults to 1
        } = req.body;

        if (!rid) {
            return res.status(400).json({
                error: 'Request ID is required'
            });
        }

        // Validate dates if both are provided
        if (tspreferreddatetimestart && tspreferreddatetimeend) {
            if (new Date(tspreferreddatetimestart) > new Date(tspreferreddatetimeend)) {
                return res.status(400).json({
                    error: 'Preferred start time must be before end time'
                });
            }
        }

        // Validate numbers if provided
        if ((tsstudents && tsstudents < 0) ||
            (tsclassrooms && tsclassrooms < 0) ||
            (tsadults && tsadults < 0)) {
            return res.status(400).json({
                error: 'Number values cannot be negative'
            });
        }

        const { data, error } = await supabase
            .from('trainingsessions')
            .insert([{
                rid,
                pid: pid || null,
                fid: fid || null,
                userid: userid || null,
                tsgrades: tsgrades || null,
                tsscheduleddatetime: tsscheduleddatetime || null,
                tspreferreddatetimestart: tspreferreddatetimestart || null,
                tspreferreddatetimeend: tspreferreddatetimeend || null,
                tsstudents: tsstudents || 0,
                tsclassrooms: tsclassrooms || 0,
                tsadults: tsadults || 0,
                tsstatusid
            }])
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


// Edit training session form
const editTrainingSessionForm = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId || isNaN(sessionId)) {
            return res.status(400).render('pages/admin-dashboard/training-sessions/edit', {
                error: 'Invalid session ID',
                trainingsession: null,
                requests: [],
                presentations: [],
                funding: [],
                educators: [],
                statuses: []
            });
        }

        // Fetch session data and all required dropdown data
        const [
            sessionResponse,
            requestsResponse,
            presentationsResponse,
            fundingResponse,
            educatorsResponse,
            statusesResponse
        ] = await Promise.all([
            supabase.from('trainingsessions').select('*').eq('tsid', sessionId).single(),
            supabase.from('requests').select('rid, schools(sname)').order('rid'),
            supabase.from('presentations').select('pid, pname').order('pname'),
            supabase.from('funding').select('fid, fname').order('fname'),
            supabase.from('users').select('userid, username').order('username'),
            supabase.from('sessionstatuses').select('sessionstatusid, statusname').order('statusname')
        ]);

        if (sessionResponse.error) throw sessionResponse.error;

        if (!sessionResponse.data) {
            return res.render('pages/admin-dashboard/training-sessions/edit', {
                error: 'Training session not found',
                trainingsession: null,
                requests: [],
                presentations: [],
                funding: [],
                educators: [],
                statuses: []
            });
        }

        res.render('pages/admin-dashboard/training-sessions/edit', {
            trainingsession: sessionResponse.data,
            requests: requestsResponse.data,
            presentations: presentationsResponse.data,
            funding: fundingResponse.data,
            educators: educatorsResponse.data,
            statuses: statusesResponse.data,
            error: null
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
            rid,
            pid,
            fid,
            userid,
            tsgrades,
            tsscheduleddatetime,
            tspreferreddatetimestart,
            tspreferreddatetimeend,
            tsstudents,
            tsclassrooms,
            tsadults,
            tsstatusid
        } = req.body;

        // Input validation
        if (tspreferreddatetimestart && tspreferreddatetimeend) {
            if (new Date(tspreferreddatetimestart) > new Date(tspreferreddatetimeend)) {
                return res.status(400).json({
                    error: 'Preferred start time must be before end time'
                });
            }
        }

        // Numbers validation
        if ((tsstudents && tsstudents < 0) ||
            (tsclassrooms && tsclassrooms < 0) ||
            (tsadults && tsadults < 0)) {
            return res.status(400).json({
                error: 'Number values cannot be negative'
            });
        }

        const { data, error } = await supabase
            .from('trainingsessions')
            .update({
                rid,
                pid: pid || null,
                fid: fid || null,
                userid: userid || null,
                tsgrades,
                tsscheduleddatetime,
                tspreferreddatetimestart,
                tspreferreddatetimeend,
                tsstudents: tsstudents || 0,
                tsclassrooms: tsclassrooms || 0,
                tsadults: tsadults || 0,
                tsstatusid: tsstatusid || 1,
                updated_at: new Date()
            })
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