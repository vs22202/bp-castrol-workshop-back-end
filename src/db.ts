import dotenv = require('dotenv');
dotenv.config();
const sql = require('mssql');

// Database configurations
const config = {
    // Test server 
    test: {
        server: 'localhost',
        options: {
            port: 1433,
            database: 'bp_capstone_project',
            trustServerCertificate: true
        },
        authentication: {
            type: "default",
            options: {
                userName: 'sa',
                password: 'CorrectHorseBatteryStapleFor$',
            },
        }
    },
    // Development server 
    production: {
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
    },
    development: {
        server: 'localhost',
        options: {
            port: 1433,
            database: 'bp_capstone_project',
            trustServerCertificate: true
        },
        authentication: {
            type: "default",
            options: {
                userName: 'sa',
                password: 'CorrectHorseBatteryStapleFor$',
            },
        }
    }
};
let retryCount = 0;
async function retryConnection(): Promise<any> {

    return new Promise((resolve, reject) => {
        const sqlPool = new sql.ConnectionPool(process.env.MODE == "test" ? config.test : process.env.MODE == "dev" ? config.development : config.production);
        let pool = null;
        sqlPool.connect().then((pool:any) => {
            console.log("Database connection established")
            resolve(pool)
        }).catch((err:any) => {
            console.log("Database is asleep");
            reject(err);
        });
    })
}

export async function initializeDB(app ?:any) {
    let pool;
    try {
        // Connect to SQL Connection Pool
        pool = await retryConnection()
        return pool;

    } catch (err) {
        if (retryCount > 10) {
            console.log('Database connection cannot be established');
            return null;
        }
        retryCount += 1;
        console.log('Retrying Database Connection.')
        setTimeout(async () => {
            pool = await initializeDB(app);
            app.locals.db = pool;
        }, 30000)
    }
}
