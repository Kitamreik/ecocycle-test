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
            .order('tsdate', { ascending: false });

        if (trainingsessionserror) throw trainingsessionserror;

        const formattedSessionsData = trainingsessionsdata.map(session => ({
            ...session,
            // Main display fields
            tsid: session.tsid,
            rid: session.tsrid, // for displaying Request #
            schoolName: session.schools?.sname || 'No School Assigned',
            scheduledDate: session.tsdate ? new Date(session.tsdate).toLocaleDateString() : 'Not Scheduled',
            scheduledStartTime: session.tsstarttime || null,
            scheduledEndTime: session.tsendtime || null,
            tsgrades: session.tsgrades || 'N/A',
            educatorName: session.users?.username || 'Not Assigned',
            statusName: session.sessionstatuses?.sessionstatusname || 'Unknown',

            // Details section
            tsstudents: session.tsstudents || 0,
            tsclassrooms: session.tsclassrooms || 0,
            tsadults: session.tsadults || 0,
            presentationName: session.presentations?.pname || 'Not Selected',
            fundingName: session.funding?.fname || 'Not Selected'
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

        const selectedRequestId = req.query.rid ? parseInt(req.query.rid) : null;
        const rid = req.query.rid ? parseInt(req.query.rid) : null;
        
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

        // Log for debugging
        console.log('Selected Request ID:', rid);
        console.log('Requests data:', requestsResponse.data);

        res.render('pages/admin-dashboard/training-sessions/add', {
            selectedRequestId: rid,  // Pass the request ID if it exists
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


const addTrainingSession = async (req, res) => {
    try {
        const {
            tsrid,        
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
            tsstatusid = 2    
        } = req.body;

        if (!tsrid) {
            return res.status(400).json({
                error: 'Request ID is required'
            });
        }

        // Create data object with only the required field first
        const sessionData = {
            tsrid,
            tsstatusid
        };

        // Add optional fields only if they have valid values
        if (tspid) sessionData.tspid = tspid;     
        if (tsfid) sessionData.tsfid = tsfid;       
        if (userid) sessionData.userid = userid;
        if (tsgrades) sessionData.tsgrades = tsgrades;

        // Handle date and times - only add if they have values
        if (tsdate && tsdate.trim() !== '') {
            sessionData.tsdate = tsdate;
        }
        if (tsstarttime && tsstarttime.trim() !== '') {
            sessionData.tsstarttime = tsstarttime;
        }
        if (tsendtime && tsendtime.trim() !== '') {
            sessionData.tsendtime = tsendtime;
        }

        // Validate times if both are provided
        if (tsstarttime && tsendtime) {
            if (tsstarttime > tsendtime) {
                return res.status(400).json({
                    error: 'Start time must be before end time'
                });
            }
        }

        // Handle numeric fields - set to 0 or the provided value
        sessionData.tsstudents = tsstudents || 0;
        sessionData.tsclassrooms = tsclassrooms || 0;
        sessionData.tsadults = tsadults || 0;
        console.log('Session Data:', sessionData);
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
            .eq('tsid', sessionId)
            .single();

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
            supabase.from('requests')
                .select('rid, schools(sid, sname)')
                .order('rid'),
            supabase.from('presentations')
                .select('pid, pname')
                .order('pname'),
            supabase.from('funding')
                .select('fid, fname')
                .order('fname'),
            supabase.from('users')
                .select('userid, username')
                .order('username'),
            supabase.from('sessionstatuses')
                .select('sessionstatusid, sessionstatusname')
                .order('sessionstatusname')
        ]);

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

const updateTrainingSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const {
            tsrid,            
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
            tsstatusid = 2   
        } = req.body;

        if (!tsrid) {
            return res.status(400).json({
                error: 'Request ID is required'
            });
        }

        // Create update object with required fields
        const updateData = {
            tsrid,
            tsstatusid,
            updated_at: new Date()
        };

        // Add optional fields only if they have valid values
        if (tspid) updateData.tspid = tspid;
        if (tsfid) updateData.tsfid = tsfid;
        if (userid) updateData.userid = userid;
        if (tsgrades) updateData.tsgrades = tsgrades;

        // Handle date and times
        if (tsdate) updateData.tsdate = tsdate;
        if (tsstarttime) updateData.tsstarttime = tsstarttime;
        if (tsendtime) updateData.tsendtime = tsendtime;

        // Validate times if both are provided
        if (tsstarttime && tsendtime) {
            if (tsstarttime > tsendtime) {
                return res.status(400).json({
                    error: 'Start time must be before end time'
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