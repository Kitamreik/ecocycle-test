// database/database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    //     db.run(`CREATE TABLE IF NOT EXISTS users (
    //             id INTEGER PRIMARY KEY AUTOINCREMENT,
    //             name TEXT,
    //             email TEXT UNIQUE
    //         )`, (err) => {
    //         if (err) {
    //             console.error('Error creating table:', err.message);
    //         }
    //     });
    }
});

module.exports = db;
