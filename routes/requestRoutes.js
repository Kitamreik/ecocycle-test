const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    next();
};

// Get all requests
router.get('/api/requests', isAuthenticated, requestController.getRequests);
router.get('/api/requests/add', isAuthenticated, requestController.addRequestForm);
router.post('/api/requests/add', isAuthenticated, requestController.addRequest);
router.get('/api/requests/edit/:requestId', isAuthenticated, requestController.editRequestForm);
router.put('/api/requests/:requestId', isAuthenticated, requestController.updateRequest);
router.delete('/api/requests/:requestId', isAuthenticated, requestController.deleteRequest);

module.exports = router;