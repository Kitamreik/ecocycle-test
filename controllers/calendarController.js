const { supabase } = require('../config/supabase');

// Get calendar view
const getCalendarView = async (req, res) => {
    try {
        // Get current date info
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

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

        const sessionsByDate = sessions.reduce((acc, session) => {
            if (!acc[session.tsdate]) {
                acc[session.tsdate] = [];
            }
            acc[session.tsdate].push(session);
            return acc;
        }, {});

        // Calculate calendar data
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth).getDay();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        res.render('pages/admin-dashboard/calendar/view', {
            sessions: sessions || [],
            sessionsByDate,
            calendarData: {
                monthName: monthNames[currentMonth],
                currentYear,
                currentMonth,
                currentDate: now.getDate(),
                firstDayOfMonth,
                daysInMonth,
                lastDayOfMonth,
                daysInPrevMonth,
                weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            error: null
        });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.render('pages/admin-dashboard/calendar/view', {
            sessions: [],
            sessionsByDate: {},
            calendarData: {
                monthName: '',
                currentYear: new Date().getFullYear(),
                currentMonth: new Date().getMonth(),
                currentDate: new Date().getDate(),
                firstDayOfMonth: 0,
                daysInMonth: 31,
                lastDayOfMonth: 0,
                daysInPrevMonth: 31,
                weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            error: 'Error retrieving calendar data'
        });
    }
};

// Get events for a specific month
const getEvents = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                error: 'Month and year are required'
            });
        }

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

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
            .gte('tsdate', startDate)
            .lte('tsdate', endDate)
            .order('tsdate', { ascending: true });

        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }

        // Process sessions for the response
        const processedSessions = sessions.map(session => ({
            ...session,
            formattedDate: new Date(session.tsdate).toLocaleDateString(),
            formattedStartTime: session.tsstarttime ? session.tsstarttime.substring(0, 5) : null,
            formattedEndTime: session.tsendtime ? session.tsendtime.substring(0, 5) : null,
            schoolName: session.schools?.sname || 'Unknown School',
            presentationName: session.presentations?.pname || 'No Presentation',
            educatorName: session.users?.username || 'Unassigned',
            status: session.sessionstatuses?.sessionstatusname || 'Unknown'
        }));

        res.json({
            success: true,
            sessions: processedSessions,
            metadata: {
                month,
                year,
                totalSessions: processedSessions.length
            }
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            error: 'Error retrieving events'
        });
    }
};

module.exports = {
    getCalendarView,
    getEvents
};