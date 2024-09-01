const express = require('express');
const router = express.Router();
const trainingRequestController = require('../controllers/trainingRequestController');

router.post('/training-requests', trainingRequestController.create);
router.get('/training-requests', trainingRequestController.getAll);
router.get('/training-requests/:id', trainingRequestController.getById);
router.put('/training-requests/:id', trainingRequestController.update);
router.delete('/training-requests/:id', trainingRequestController.delete);

module.exports = router;