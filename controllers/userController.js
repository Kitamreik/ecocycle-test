const User = require('../models/userModel');

const userController = {
    userHome: (req, res) => {
        if (res.ok) {
            console.log("User home logged");
        }
        res.redirect('/users/home');
    },
    getAllUsers: (req, res) => {
        User.findAll((err, users) => {
            if (err) {
                res.status(500).send('Error retrieving users');
            } else {
                res.status(200).send(users);
            }
        });
    },
    getUserById: (req, res) => {
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.status(500).send('Error retrieving user');
            } else {
                res.status(200).send(user);
            }
        });
    },
    createUser: (req, res) => {
        User.create(req.body, (err, id) => {
            if (err) {
                res.status(500).send('Error creating user');
            } else {
                res.status(201).send({ id });
            }
        });
    },
    updateUser: (req, res) => {
        User.update(req.params.id, req.body, (err, changes) => {
            if (err) {
                res.status(500).send('Error updating user');
            } else {
                res.status(200).send({ changes });
            }
        });
    },
    deleteUser: (req, res) => {
        User.delete(req.params.id, (err, changes) => {
            if (err) {
                res.status(500).send('Error deleting user');
            } else {
                res.status(200).send({ changes });
            }
        });
    }
};

module.exports = userController;