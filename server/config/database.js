const sql = require('mssql');

const dbConfig = {
    user: 'SA',
    password: '12345',
    server: 'localhost', // Hoặc địa chỉ server SQL Server
    database: 'DrugUsePreventionDB',
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
    sql, poolPromise
};