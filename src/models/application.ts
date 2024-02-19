/**
 * The user uploaded application
 */

export class Application {
    application_id?: number
    workshop_name: string
    workshop_post_code : string
    address : string
    state : string
    city : string
    user_name : string
    user_email : string
    user_mobile : number
    bay_count : number
    services_offered : string
    expertise : string
    brands : string
    consent_process_data : boolean
    consent_being_contacted : boolean
    consent_receive_info : boolean
    file_paths: string[]

    constructor(data : any, files? : Express.Multer.File[]) {
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

        this.file_paths = [];
        if(files && Array.isArray(files)) {
            const fileArray = files;
            fileArray.forEach((file: Express.Multer.File) => {
                this.file_paths.push(file.path);
            });
        }
    }

}