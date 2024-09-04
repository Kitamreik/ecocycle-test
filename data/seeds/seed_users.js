function seedData(db) {
    // Clear existing data
    db.run('DELETE FROM users', (err) => {
        if (err) {
            console.error('Error clearing users table:', err.message);
        } else {
            // Insert sample data
            const sampleData = [
                { name: 'John Doeasd', email: 'john.dasoe@example.com' },
                { name: 'Janasde Smasith', email: 'jane.smithasd@example.com' },
                { name: 'Aalice Johnasson', email: 'alice.jasohnson@example.com' }
            ];

            const insertStmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
            sampleData.forEach(user => {
                insertStmt.run(user.name, user.email, (err) => {
                    if (err) {
                        console.error('Error inserting data into users table:', err.message);
                    }
                });
            });
            insertStmt.finalize((err) => {
                if (err) {
                    console.error('Error finalizing insert statement:', err.message);
                } else {
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
    });
}

module.exports = seedData;
