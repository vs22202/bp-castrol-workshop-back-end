import sql, { ConnectionPool } from 'mssql';
import app from '..';
/**
 * The user login details
 */

export class User {
    user_email : string;
    password : string;

    constructor(user_email : string, password : string) {
        this.user_email = user_email;
        this.password = password;
    }
}