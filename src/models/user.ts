/**
 * User model
 */

export class User {
    // User variables
    user_email: string;
    password: string;
    verified: boolean;

    // Default constructor
    constructor(user_email: string, password: string) {
        this.user_email = user_email;
        this.password = password;
        this.verified = false;
    }
}