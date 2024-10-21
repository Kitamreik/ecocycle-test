const express = require('express');
const router = express.Router();
const fundingController = require('../controllers/fundingController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Get all funding sources
router.get('/api/fundings', isAuthenticated, fundingController.getFundings);
router.post('/api/fundings/add', isAuthenticated, fundingController.addFunding);
router.get('/api/fundings/edit/:fundingId', isAuthenticated, fundingController.editFundingForm);
router.post('/api/fundings/edit/:fundingId', isAuthenticated, (req, res, next) => {
    req.method = 'PUT';
    next();
}, fundingController.updateFunding);
router.delete('/api/fundings/delete/:fundingId', isAuthenticated, fundingController.deleteFunding);

module.exports = router;
