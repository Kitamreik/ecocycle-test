const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const seedData = require('./seeds/seed_users'); // Import the seedData function

const dir = path.resolve(__dirname, '..', 'db');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const db = new sqlite3.Database(path.join(dir, 'db.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create tables and seed data
    createTables(() => {
        seedData(db); // Pass the db connection to seedData
    });
}

function createTables(callback) {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 name TEXT,
                                                 email TEXT UNIQUE
            )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created or already exists.');
            // Proceed to next step (callback)
            callback();
        }
    });
}

module.exports = db;
