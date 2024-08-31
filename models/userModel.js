//interacts with the SQL Lite Database
// models/userModel.js
const db = require('../data/data');

const User = {
    // create: (userData, callback) => {
    //     const { name, email } = userData;
    //     db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
    //         if (err) {
    //             callback(err);
    //         } else {
    //             callback(null, this.lastID);
    //         }
    //     });
    // },

    // findAll: (callback) => {
    //     db.all('SELECT * FROM users', [], (err, rows) => {
    //         if (err) {
    //             callback(err);
    //         } else {
    //             callback(null, rows);
    //         }
    //     });
    // }
};

module.exports = User;
