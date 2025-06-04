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




//     // Save reset token
//     static async saveResetToken(accountId, token, expiry) {
//         const query = `
//         UPDATE accounts 
//         SET ResetToken = ?, ResetTokenExpiry = ? 
//         WHERE AccountID = ?
//     `;
//         return await db.execute(query, [token, expiry, accountId]);
//     }

//     // Find user by reset token
//     static async findByResetToken(token) {
//         const query = `
//         SELECT * FROM accounts 
//         WHERE ResetToken = ? AND ResetTokenExpiry > NOW()
//     `;
//         const [rows] = await db.execute(query, [token]);
//         return rows[0];
//     }

//     // Update password
//     static async updatePassword(accountId, hashedPassword) {
//         const query = `
//         UPDATE accounts 
//         SET Password = ? 
//         WHERE AccountID = ?
//     `;
//         return await db.execute(query, [hashedPassword, accountId]);
//     }

//     // Clear reset token
//     static async clearResetToken(accountId) {
//         const query = `
//         UPDATE accounts 
//         SET ResetToken = NULL, ResetTokenExpiry = NULL 
//         WHERE AccountID = ?
//     `;
//         return await db.execute(query, [accountId]);
//     }
// }

// Save reset token
static async saveResetToken(accountId, token, expiry) {
    const query = `
        UPDATE accounts 
        SET ResetToken = ?, ResetTokenExpiry = ? 
        WHERE AccountID = ?
    `;
    return await db.execute(query, [token, expiry, accountId]);
}

// Find user by reset token
static async findByResetToken(token) {
    const query = `
        SELECT * FROM accounts 
        WHERE ResetToken = ? AND ResetTokenExpiry > GETDATE()
    `;
    const [rows] = await db.execute(query, [token]);
    return rows[0];
}

// Update password
static async updatePassword(accountId, hashedPassword) {
    const query = `
        UPDATE accounts 
        SET Password = ? 
        WHERE AccountID = ?
    `;
    return await db.execute(query, [hashedPassword, accountId]);
}

// Clear reset token
static async clearResetToken(accountId) {
    const query = `
        UPDATE accounts 
        SET ResetToken = NULL, ResetTokenExpiry = NULL 
        WHERE AccountID = ?
    `;
    return await db.execute(query, [accountId]);
}

}
module.exports = Account;