const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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
        seedData();
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

function seedData() {
    // Clear existing data
    db.run('DELETE FROM users', (err) => {
        if (err) {
            console.error('Error clearing users table:', err.message);
        } else {
            // Insert sample data
            const sampleData = [
                { name: 'John Doe', email: 'john.doe@example.com' },
                { name: 'Jane Smith', email: 'jane.smith@example.com' },
                { name: 'Alice Johnson', email: 'alice.johnson@example.com' }
            ];

            const insertStmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
            sampleData.forEach(user => {
                insertStmt.run(user.name, user.email, (err) => {
                    if (err) {
                        console.error('Error inserting data into users table:', err.message);
                    }
                });
            });
            insertStmt.finalize();

            // Fetch and log all users
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) {
                    console.error('Error fetching data:', err.message);
                } else {
                    console.log('Users:', rows);
                }
            });
        }
    });
}

module.exports = db;
