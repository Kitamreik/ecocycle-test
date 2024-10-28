const express = require('express');
const router = express.Router();
const trainingSessionController = require('../controllers/trainingSessionController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    // if (req.session.isAuthenticated) {
    //     next();
    // } else {
    //     res.redirect('/admin/login');
    // }
    next();
};

// Get all training sessions
router.get('/api/training-sessions', isAuthenticated, trainingSessionController.getTrainingSessions);
router.get('/api/training-sessions/add', isAuthenticated, trainingSessionController.addTrainingSessionForm);
router.post('/api/training-sessions/add', isAuthenticated, trainingSessionController.addTrainingSession);
router.get('/api/training-sessions/edit/:sessionId', isAuthenticated, trainingSessionController.editTrainingSessionForm);
router.put('/api/training-sessions/:sessionId', isAuthenticated, trainingSessionController.updateTrainingSession);
router.delete('/api/training-sessions/:sessionId', isAuthenticated, trainingSessionController.deleteTrainingSession);

module.exports = router;
