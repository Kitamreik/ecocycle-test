//handle the application logic
// controllers/userController.js
const User = require('../models/userModel');

const userController = {
    userHome: (req, res) => {
        if (res.ok) {
            console.log("User home logged")
        }
        res.redirect('/users/home')
    }
    // createUser: (req, res) => {
    //     User.create(req.body, (err, userId) => {
    //         if (err) {
    //             res.status(500).send('Error creating user');
    //         } else {
    //             res.redirect('/users');
    //         }
    //     });
    // },

    // getUsers: (req, res) => {
    //     User.findAll((err, users) => {
    //         if (err) {
    //             res.status(500).send('Error retrieving users');
    //         } else {
    //             res.render('index', { users });
    //         }
    //     });
    // }
};

module.exports = userController;
