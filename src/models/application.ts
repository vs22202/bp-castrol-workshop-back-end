import path from "path"
import { uploadFile } from "../utils/firebase"
import { getDownloadURL } from "firebase/storage"
/**
 * Application model
 */

export class Application {
    // Application variables
    application_id?: number
    workshop_name: string
    workshop_post_code: string
    address: string
    state: string
    city: string
    user_name: string
    user_email: string
    user_mobile: number
    bay_count: number
    services_offered: string
    expertise: string
    brands: string
    consent_process_data: boolean
    consent_being_contacted: boolean
    consent_receive_info: boolean
    file_paths: string[]
    application_status: string
    last_modified_date: string

    // Default constructor
    constructor(data: any) {
        this.workshop_name = data.workshop_name;
        this.workshop_post_code = data.workshop_post_code;
        this.address = data.address;
        this.state = data.state;
        this.city = data.city;
        this.user_name = data.user_name;
        this.user_email = data.user_email;
        this.user_mobile = data.user_mobile;
        this.bay_count = data.bay_count;
        this.services_offered = data.services_offered;
        this.expertise = data.expertise;
        this.brands = data.brands;
        this.consent_process_data = data.consent_process_data;
        this.consent_being_contacted = data.consent_being_contacted;
        this.consent_receive_info = data.consent_receive_info;
        this.application_status = ApplicationStatus.Pending;
        this.last_modified_date = (new Date()).toISOString();

        this.file_paths = [];

    }

    uploadFiles = async (files?: Express.Multer.File[]): Promise<void> => {
        // Uploading files to cloud asynchronously and saving url in file_paths
        let p: Promise<string>[] = []
        if (files && Array.isArray(files)) {
            files.forEach(async (file: Express.Multer.File) => {
                p.push(uploadFile(file))
            });
        }
        return new Promise((resolve) => {
            Promise.all(p).then((values) => {
                this.file_paths = values;
                resolve()
            })
        })
    }

}

// Application Status Enum
export enum ApplicationStatus {
    Pending = 'Pending',
    InReview = 'InReview',
    Processing = 'Processing',
    Approved = 'Approved',
    Rejected = 'Rejected'
}