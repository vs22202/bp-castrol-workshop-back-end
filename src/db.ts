import dotenv = require('dotenv');
dotenv.config();
const sql = require('mssql');

// Database configurations
const config = {
    // Test server 
    test: {
        server: process.env.TEST_SERVER_NAME,
        options: {
            port: 1433,
            database: process.env.TEST_DATABASE_NAME
        },
        authentication: {
            type: "default",
            options: {
                userName: process.env.USER_NAME,
                password: process.env.PASSWORD,
            }
        }
    },
    // Development server 
    development: {
        server: process.env.SERVER_NAME,
        options: {
            port: 1433,
            database: process.env.DATABASE_NAME
        },
        authentication: {
            type: "default",
            options: {
                userName: process.env.USER_NAME,
                password: process.env.PASSWORD,
            }
        }
    }
};


export async function initializeDB() {
    try {
        // Connect to SQL Connection Pool
        const sqlPool = await new sql.ConnectionPool(process.env.TEST == "true" ? config.test : config.development);
        const pool = await sqlPool.connect();

        console.log('Database Connection Established');
        return pool;

    } catch (err) {
        // Handle error
        console.log(err);
        return null;
    }
}
