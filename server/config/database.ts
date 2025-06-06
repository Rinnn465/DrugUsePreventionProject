import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();
const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Use true if you're on Azure or need encryption
    trustServerCertificate: true // For development only
  }
};

// Create and export a pool connection
const poolPromise: Promise<sql.ConnectionPool> = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed!', err);
    throw err;
  });

export { sql, poolPromise };