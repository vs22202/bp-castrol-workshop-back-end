import tedious = require('tedious')
import dotenv = require('dotenv');
dotenv.config();

const config = {
    test: {
        server: process.env.SERVER_NAME,
        options: {
            port: 1433,
            database: process.env.TEST_DATABASE_NAME
        },
        authentication: {
            type: "default",
            options: {
                userName: process.env.USERNAME,
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
                userName: process.env.USERNAME,
                password: process.env.PASSWORD,
            }
        }
    }
};
let connection:tedious.Connection|null = null;
export async function initializeDB(): Promise<tedious.Connection> {
    if (connection == null) {
        const conn = new tedious.Connection(process.env.TEST == "true" ? config.test : config.development);
        return new Promise((resolve, reject) => {
            conn.on("connect", (err: Error): void => {
                if (err) {
                    console.log('Error: ', err);
                    reject(err);
                    return;
                }
                else {
                    connection = conn;
                    resolve(conn)
                }
                console.log("Database Connection Established");
            });
            conn.connect();
        })
    }
    else return connection;
}
