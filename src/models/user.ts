/**
 * User model
 */

export class User {
    // User variables
    user_email?: string;
    user_mobile?: number;
    password: string;
    verified: boolean;

    // Default constructor
    constructor(password: string,user_email?: string,user_mobile?: number) {
        this.user_email = user_email;
        this.user_mobile = user_mobile;
        this.password = password;
        this.verified = false;
    }
}