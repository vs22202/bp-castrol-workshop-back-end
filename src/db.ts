import tedious = require('tedious')
import dotenv = require('dotenv');
dotenv.config();
const sql = require('mssql');


const config = {
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
        
        const appPool = await new sql.ConnectionPool(process.env.TEST == "true" ? config.test : config.development);
        const pool = await appPool.connect();
        console.log('Database Connection Established');
        return pool;

    } catch(err) {
        console.log(err);
        return null;
    }
}
