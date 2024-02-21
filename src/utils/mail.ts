import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";

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
export default SENDMAIL;