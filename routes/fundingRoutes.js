const express = require('express');
const router = express.Router();
const fundingController = require('../controllers/fundingController');

const isAuthenticated = (req, res, next) => {
    next();
};

// Match the exact pattern from userRoutes.js
router.get('/api/fundings', isAuthenticated, fundingController.getFundings);
router.get('/api/fundings/add', fundingController.addFundingForm);
router.post('/api/fundings/add', isAuthenticated, fundingController.addFunding);
router.get('/api/fundings/edit/:fundingId', isAuthenticated, fundingController.editFundingForm);
router.put('/api/fundings/:fundingId', isAuthenticated, fundingController.updateFunding);
router.delete('/api/fundings/:fundingId', isAuthenticated, fundingController.deleteFunding);

module.exports = router;