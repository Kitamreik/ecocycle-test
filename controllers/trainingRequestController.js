const TrainingRequest = require('../models/trainingRequestModel');

const trainingRequestController = {
    create: (req, res) => {
        TrainingRequest.create(req.body, (err, id) => {
            if (err) {
                res.status(500).send('Error creating training request');
            } else {
                res.status(201).send({ id });
            }
        });
    },
    getAll: (req, res) => {
        TrainingRequest.findAll((err, requests) => {
            if (err) {
                res.status(500).send('Error retrieving training requests');
            } else {
                res.status(200).send(requests);
            }
        });
    },
    getById: (req, res) => {
        TrainingRequest.findById(req.params.id, (err, request) => {
            if (err) {
                res.status(500).send('Error retrieving training request');
            } else {
                res.status(200).send(request);
            }
        });
    },
    update: (req, res) => {
        TrainingRequest.update(req.params.id, req.body, (err, changes) => {
            if (err) {
                res.status(500).send('Error updating training request');
            } else {
                res.status(200).send({ changes });
            }
        });
    },
    delete: (req, res) => {
        TrainingRequest.delete(req.params.id, (err, changes) => {
            if (err) {
                res.status(500).send('Error deleting training request');
            } else {
                res.status(200).send({ changes });
            }
        });
    }
};

module.exports = trainingRequestController;