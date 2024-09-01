const db = require('../data/data');

const TrainingRequest = {
    create: (data, callback) => {
        const { contactDetails, preferredDates, gradeLevels } = data;
        db.run('INSERT INTO training_requests (contactDetails, preferredDates, gradeLevels) VALUES (?, ?, ?)', [contactDetails, preferredDates, gradeLevels], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.lastID);
            }
        });
    },
    findAll: (callback) => {
        db.all('SELECT * FROM training_requests', [], (err, rows) => {
            if (err) {
                callback(err);
            } else {
                callback(null, rows);
            }
        });
    },
    findById: (id, callback) => {
        db.get('SELECT * FROM training_requests WHERE id = ?', [id], (err, row) => {
            if (err) {
                callback(err);
            } else {
                callback(null, row);
            }
        });
    },
    update: (id, data, callback) => {
        const { contactDetails, preferredDates, gradeLevels, status, notes } = data;
        db.run('UPDATE training_requests SET contactDetails = ?, preferredDates = ?, gradeLevels = ?, status = ?, notes = ? WHERE id = ?', [contactDetails, preferredDates, gradeLevels, status, notes, id], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.changes);
            }
        });
    },
    delete: (id, callback) => {
        db.run('DELETE FROM training_requests WHERE id = ?', [id], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.changes);
            }
        });
    }
};

module.exports = TrainingRequest;