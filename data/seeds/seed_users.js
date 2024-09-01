module.exports = function(db) {
    const sampleData = [
        { name: 'John Doe', email: 'john.doe@example.com' },
        { name: 'Jane Smith', email: 'jane.smith@example.com' },
        { name: 'Alice Johnson', email: 'alice.johnson@example.com' }
    ];

    db.run('DELETE FROM users', (err) => {
        if (err) {
            console.error('Error clearing users table:', err.message);
        } else {
            const insertStmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
            sampleData.forEach(user => {
                insertStmt.run(user.name, user.email, (err) => {
                    if (err) {
                        console.error('Error inserting data into users table:', err.message);
                    }
                });
            });
            insertStmt.finalize();
            
            console.log('Sample users data inserted.');
        }
    });
};
