import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import { Application, UpdateApplication } from "../models/application";

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
export const generateHTML = (application: Application) => {
    let field: keyof Application;
    let data = ''
    for (field in application) {
        if (field == "uploadFiles" || field=="last_modified_date" ) continue;
        let imgG=''
        if (field == "file_paths") {
            application[field]?.forEach((fileUrl) => {
                if (fileUrl.search("mp4") !== -1) {
                    imgG += `<a href="${fileUrl}" target="_blank" style="text-decoration: none;color: transparent;max-width: 100%;">
                    <video src="${fileUrl}" style="max-width: 100%;display: block;aspect-ratio: 1/1;">
                </video></a>`
                }
                else{
                    imgG +=`<a href="${fileUrl}" target="_blank" style="text-decoration: none;color: transparent;max-width: 100%;">
                    <img src="${fileUrl}" style="max-width: 100%;display: block;aspect-ratio: 1/1;">
                </a>`
                }
            })
            data += `<div style="width: 100%;display: flex;justify-content: space-between;flex-direction: column;align-items: center;grid-column: 1/-1;">
            <p style="font-size: 20px;font-weight: bold;color: rgba(51, 51, 51, 1);">Files Uploaded</p>
            <div style="display: grid;grid-template-columns: 1fr 1fr 1fr;width: 100%;gap: 2em;">
            ${imgG}
            </div>
        </div>`
            continue;
        }
        data += `<div style="width: 90%;display: flex;justify-content: space-between;">
        <p style="font-size: 20px;font-weight: bold;color: rgba(51, 51, 51, 1);">${field.replace("_"," ")}</p>
        <p style="font-size: 20px;font-weight: 400;color: rgba(102, 102, 102, 1);">${application[field]}</p>
    </div>`
    }
    const result = `<html>
  
    <div style="padding-block: 32px;padding-inline: 72px;display: flex;flex-direction: column;text-transform: capitalize;">
      <h2 style="margin: 0;padding: 0;font-size: 40;font-weight: bold;color: rgba(0, 153, 0, 1);">
        Certificate Application
      </h2>
      <h3 style="margin: 0;padding: 0;color: rgba(102, 102, 102, 1);font-size: 28px;font-weight: 500;">Here is the submitted information:</h3>
      <div style="margin: 0;padding: 0;display: grid;grid-template-columns: 1fr 1fr;position: relative;">
      ${data}
      </div>
    </div>
</html>

  `
    return result;
}
export const generateHTMLUpdate = (application: UpdateApplication) => {
    let field: keyof UpdateApplication;
    let data = ''
    for (field in application) {
        if (field == "uploadFiles" || field =="filesOld" || field=="last_modified_date") continue;
        let imgG=''
        if (field == "file_paths") {
            application[field]?.forEach((fileUrl) => {
                if (fileUrl.search("mp4") !== -1) {
                    imgG += `<a href="${fileUrl}" target="_blank" style="text-decoration: none;color: transparent;max-width: 100%;">
                    <video src="${fileUrl}" style="max-width: 100%;display: block;aspect-ratio: 1/1;">
                </video></a>`
                }
                else{
                    imgG +=`<a href="${fileUrl}" target="_blank" style="text-decoration: none;color: transparent;max-width: 100%;">
                    <img src="${fileUrl}" style="max-width: 100%;display: block;aspect-ratio: 1/1;">
                </a>`
                }
            })
            data += `<div style="width: 100%;display: flex;justify-content: space-between;flex-direction: column;align-items: center;grid-column: 1/-1;">
            <p style="font-size: 20px;font-weight: bold;color: rgba(51, 51, 51, 1);">Files Uploaded</p>
            <div style="display: grid;grid-template-columns: 1fr 1fr 1fr;width: 100%;gap: 2em;">
            ${imgG}
            </div>
        </div>`
            continue;
        }
        data += `<div style="width: 90%;display: flex;justify-content: space-between;">
        <p style="font-size: 20px;font-weight: bold;color: rgba(51, 51, 51, 1);">${field.replace("_"," ")}</p>
        <p style="font-size: 20px;font-weight: 400;color: rgba(102, 102, 102, 1);">${application[field]}</p>
    </div>`
    }
    const result = `<html>
  
    <div style="padding-block: 32px;padding-inline: 72px;display: flex;flex-direction: column;text-transform: capitalize;">
      <h2 style="margin: 0;padding: 0;font-size: 40;font-weight: bold;color: rgba(0, 153, 0, 1);">
        Certificate Application
      </h2>
      <h3 style="margin: 0;padding: 0;color: rgba(102, 102, 102, 1);font-size: 28px;font-weight: 500;">Here is the submitted information:</h3>
      <div style="margin: 0;padding: 0;display: grid;grid-template-columns: 1fr 1fr;position: relative;">
      ${data}
      </div>
    </div>
</html>

  `
    return result;
}
export default SENDMAIL;