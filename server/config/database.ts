import * as sql from "mssql";

const dbConfig: sql.config = {
  user: "SA",
  password: "12345",
  server: "localhost",
  database: "DrugUsePreventionDB",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const poolPromise: Promise<sql.ConnectionPool> = new sql.ConnectionPool(
  dbConfig
)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.log("Database Connection Failed! Bad Config: ", err);
    throw err;
  });

export { sql, poolPromise };
