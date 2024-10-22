const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    // if (req.session.isAuthenticated) {
    //     next();
    // } else {
    //     res.redirect('/admin/login');
    // }
    next();
};

// Get all requests
router.get('/api/requests', isAuthenticated, requestController.getRequests);
router.get('/add', isAuthenticated, requestController.addRequestForm);
router.post('/add', isAuthenticated, requestController.addRequest);
router.get('/edit/:requestId', isAuthenticated, requestController.editRequestForm);
router.post('/edit/:requestId', isAuthenticated, (req, res, next) => {
    req.method = 'PUT';
    next();
}, requestController.updateRequest);
router.delete('/delete/:requestId', isAuthenticated, requestController.deleteRequest);

module.exports = router;