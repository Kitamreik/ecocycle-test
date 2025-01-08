const { supabase } = require('../config/supabase');

// Get calendar view
const getCalendarView = async (req, res) => {
    try {
        // Fetch all training sessions with related data
        const { data: sessions, error } = await supabase
            .from('trainingsessions')
            .select(`
                tsid,
                tsdate,
                tsstarttime,
                tsendtime,
                tsgrades,
                tsstudents,
                tsclassrooms,
                tsadults,
                schools (
                    sname
                ),
                presentations (
                    pname
                ),
                users (
                    username
                ),
                sessionstatuses (
                    sessionstatusname
                )
            `)
            .order('tsdate', { ascending: true });

        if (error) throw error;

        // Format sessions for calendar view
        const calendarEvents = sessions.map(session => ({
            id: session.tsid,
            title: `${session.schools?.sname || 'Unknown School'} - ${session.presentations?.pname || 'No Presentation'}`,
            start: session.tsdate + (session.tsstarttime ? 'T' + session.tsstarttime : ''),
            end: session.tsdate + (session.tsendtime ? 'T' + session.tsendtime : ''),
            extendedProps: {
                educator: session.users?.username || 'Unassigned',
                grades: session.tsgrades || 'N/A',
                students: session.tsstudents || 0,
                classrooms: session.tsclassrooms || 0,
                adults: session.tsadults || 0,
                status: session.sessionstatuses?.sessionstatusname || 'Unknown'
            }
        }));

        res.render('pages/admin-dashboard/calendar/view.ejs', {
            events: calendarEvents,
            error: null
        });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.render('pages/admin-dashboard/calendar', {
            events: [],
            error: 'Error retrieving calendar data'
        });
    }
};

// Get events for a specific date range
const getEvents = async (req, res) => {
    try {
        const { start, end } = req.query;

        const { data: sessions, error } = await supabase
            .from('trainingsessions')
            .select(`
                tsid
            `)
            .gte('tsdate', start)
            .lte('tsdate', end)
            .order('tsdate', { ascending: true });

        if (error) throw error;

        const events = sessions.map(session => ({
            id: session.tsid,
            title: `${session.schools?.sname || 'Unknown School'} - ${session.presentations?.pname || 'No Presentation'}`,
            start: session.tsdate + (session.tsstarttime ? 'T' + session.tsstarttime : ''),
            end: session.tsdate + (session.tsendtime ? 'T' + session.tsendtime : ''),
            status: session.sessionstatuses?.sessionstatusname || 'Unknown',
            educator: session.users?.username || 'Unassigned'
        }));

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Error retrieving events' });
    }
};

module.exports = {
    getCalendarView,
    getEvents
};