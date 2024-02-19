/**
 * The user login details
 */

export class User {
    user_email : string;
    password : string;
    validated : boolean;

    constructor(user_email : string, password : string) {
        this.user_email = user_email;
        this.password = password;
        this.validated = false;
    }
}