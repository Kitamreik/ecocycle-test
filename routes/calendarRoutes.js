const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

const isAuthenticated = (req, res, next) => {
    next();
};

router.get('/api/calendar', isAuthenticated, calendarController.getCalendarView);
router.get('/api/calendar/events', isAuthenticated, calendarController.getEvents);

module.exports = router;