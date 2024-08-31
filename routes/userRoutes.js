//define the application routes
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userCtrl');

router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.get('/users/home', userController.userHome)

module.exports = router;
