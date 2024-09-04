const sqlite3 = require('sqlite3').verbose();
const path = require('path');
// Path to the test database
const dbTestPath = path.resolve(__dirname, '..', 'test_db', 'test_db.sqlite');

// Open the test database connection
const db = new sqlite3.Database(dbTestPath, (err) => {
    if (err) {
        console.error('Error opening test database:', err.message);
    } else {
        console.log('Connected to the test SQLite database.');
        setupDatabase();
    }
});

// Function to set up the database schema and seed data (run only for testing purposes)
function setupDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                seedData();
            }
        });
    });
}

// Function to seed data into the test database
function seedData() {
    const User = require('../models/userModel')(db); // Pass the db connection
    const sampleData = [
        { name: 'Janeas Smith', email: 'jane.bbb@example.com' },
        { name: 'Aliceas Johnson', email: 'alice.ccc@example.com' }
    ];

    sampleData.forEach(user => {
        User.create(user, (err) => {
            if (err && err.message.includes('UNIQUE constraint failed')) {
                console.log(`Skipped inserting ${user.email}: already exists.`);
            } else if (err) {
                console.error('Error inserting data into users table:', err.message);
            } else {
                console.log(`Inserted ${user.name} (${user.email}) successfully.`);
            }
        });
    });

    performCrudOperations();
}

function performCrudOperations() {
    console.log('Starting CRUD operations...');

    const User = require('../models/userModel')(db); // Pass the db connection
    const uniqueEmail = `john.doe+${Date.now()}@example.com`; // Generates a unique email

    // 1. Create a new user with a unique email
    User.create({ name: 'John Doe', email: uniqueEmail }, (err, id) => {
        if (err) {
            console.error('Error creating user:', err.message);
            return;
        }
        console.log(`User created successfully with ID: ${id}`);

        // 2. Retrieve all users and print them
        User.findAll((err, users) => {
            if (err) {
                console.error('Error retrieving users:', err.message);
                return;
            }

            console.log('All users in the database:');
            users.forEach((user) => {
                console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            });

            // // 3. Delete all data from the database
            // db.run('DELETE FROM users', (err) => {
            //     if (err) {
            //         console.error('Error deleting data from users table:', err.message);
            //     } else {
            //         console.log('All data deleted from the database.');
            //     }
            //
            //     // 4. Close the database connection
            //     // db.close((err) => {
            //     //     if (err) {
            //     //         console.error('Error closing database:', err.message);
            //     //     } else {
            //     //         console.log('Test database connection closed.');
            //     //     }
            //     // });
            // });
        });
    });
}
