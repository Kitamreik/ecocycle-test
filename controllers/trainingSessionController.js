const { supabase } = require('../config/supabase');

// Fetch all training sessions
const getTrainingSessions = async (req, res) => {
    try {
        const { data: trainingsessionsdata, error: trainingsessionserror } = await supabase
            .from('trainingsessions')
            .select(`
                tsid,
                requests (
                    schools (
                        sname
                    )
                ),
                presentations (
                    pname
                ),
                funding (
                    fname
                ),
                users (
                    username
                ),
                tsgrades,
                tsscheduleddatetime,
                tspreferreddatetimestart,
                tspreferreddatetimeend,
                tsstudents,
                tsclassrooms,
                tsadults
            `);

        if (trainingsessionserror) throw trainingsessionserror;
        console.log(JSON.stringify(trainingsessionsdata, null, 2));
        res.render('pages/admin-dashboard/trainingSessions/view', { trainingsessions: trainingsessionsdata || [] });
    } catch (error) {
        console.error('error fetching training sessions data:', error);
        res.status(500).json({ error: 'error retrieving data from supabase' });
    }
};

// Add a new training session
const addTrainingSession = async (req, res) => {
    try {
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

        const { data, error } = await supabase
            .from('trainingsessions')
            .insert([{
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
            }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'training session added successfully', data });
    } catch (error) {
        console.error('error adding new training session:', error);
        res.status(500).json({ error: 'error adding new training session to supabase' });
    }
};

// Edit training session form
const editTrainingSessionForm = async (req, res) => {
    try {
        const { data: trainingsessiondata, error: trainingsessionerror } = await supabase
            .from('trainingsessions')
            .select('*')
            .eq('tsid', req.params.trainingsessionid)
            .single();

        if (trainingsessionerror) throw trainingsessionerror;

        if (!trainingsessiondata) {
            return res.status(404).json({ error: 'training session not found' });
        }

        res.json({ trainingsession: trainingsessiondata });
    } catch (error) {
        console.error('error fetching training session data for edit:', error);
        res.status(500).json({ error: 'error retrieving training session data from supabase' });
    }
};

// Update training session
const updateTrainingSession = async (req, res) => {
    try {
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

        const { data, error } = await supabase
            .from('trainingsessions')
            .update({
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
                updated_at: new Date()
            })
            .eq('tsid', req.params.trainingsessionid)
            .select();

        if (error) throw error;

        res.json({ message: 'training session updated successfully', data });
    } catch (error) {
        console.error('error updating training session:', error);
        res.status(500).json({ error: 'error updating training session in supabase' });
    }
};

// Delete training session
const deleteTrainingSession = async (req, res) => {
    try {
        const { error } = await supabase
            .from('trainingsessions')
            .delete()
            .eq('tsid', req.params.trainingsessionid);

        if (error) throw error;

        res.json({ message: 'training session deleted successfully' });
    } catch (error) {
        console.error('error deleting training session:', error);
        res.status(500).json({ error: 'error deleting training session from supabase' });
    }
};

module.exports = {
    getTrainingSessions,
    addTrainingSession,
    editTrainingSessionForm,
    updateTrainingSession,
    deleteTrainingSession
};
