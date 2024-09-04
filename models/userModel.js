const User = (db) => ({
    create: (userData, callback) => {
        const { name, email } = userData;
        db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.lastID);
            }
        });
    },
    findAll: (callback) => {
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) {
                callback(err);
            } else {
                callback(null, rows);
            }
        });
    },
    findById: (id, callback) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) {
                callback(err);
            } else {
                callback(null, row);
            }
        });
    },
    update: (id, userData, callback) => {
        const { name, email } = userData;
        db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.changes);
            }
        });
    },
    delete: (id, callback) => {
        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.changes);
            }
        });
    }
});

module.exports = User;
