import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import fs from 'fs'

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_SERVER_USERNAME,
        pass: process.env.SMTP_SERVER_PASSWORD,
    },
});

// Send mail function
const SENDMAIL = async (options: Options, callback: any) => {
    try {
        const info = await transporter.sendMail(options)
        callback(info);

    } catch (error) {
        console.log(error);
    }
};
export const generateHTML = async (accessToken: string) => {
    let data = fs.readFileSync('src/utils/workshopData.html', 'utf8')
    data = data.replace(/{{token}}/, accessToken)
    data = data.replace(/{{backend_url}}/, process.env.BACKEND_URL || 'http://localhost:3000');
    return data;

}

export const generateCSV = async (accessToken: string) => {
    
}

export default SENDMAIL;