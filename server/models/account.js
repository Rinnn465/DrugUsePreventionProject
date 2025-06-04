const { sql, poolPromise } = require('../config/database');

class Account {
    static async findByEmail(email) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            const result = await request
                .input('email', sql.VarChar, email)
                .query('SELECT * FROM Account WHERE Email = @email AND IsDisabled = 0');

            return result.recordset[0];
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    static async create(username, email, password, fullName, dateOfBirth) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            const result = await request
                .input('username', sql.VarChar, username)
                .input('email', sql.VarChar, email)
                .input('password', sql.VarChar, password)
                .input('fullName', sql.VarChar, fullName)
                .input('dateOfBirth', sql.Date, dateOfBirth)
                .input('role', sql.VarChar, 'member')
                .input('createdAt', sql.DateTime2, new Date())
                .query('INSERT INTO Account (Username, Email, Password, FullName, DateOfBirth, Role, CreatedAt) VALUES (@username, @email, @password, @fullName, @dateOfBirth, @role, @createdAt); SELECT SCOPE_IDENTITY() AS id');
            return result.recordset[0].id;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}

module.exports = Account;