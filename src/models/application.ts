import {initializeDB} from "../db";
import tedious = require('tedious')
/**
 * The user uploaded application
 */

export class Application {
    /** An auto incremented number for the application */
    Application_Id?: number
    /** The name of the workshop */
    Workshop_Name: string
    /** The name of the user */
    User_Name: string

    constructor(id: number, workshop_name: string, user_name: string) {
        this.Application_Id = id;
        this.Workshop_Name = workshop_name;
        this.User_Name = user_name;
    }
    static async insert(application: Application): Promise<number> {
        const request = new tedious.Request("INSERT INTO Applications VALUES (@workshop_name,@user_name); select @@identity", (error: Error, rowCount: number): void => {
        });
        const connection = await initializeDB();
        request.addParameter("workshop_name", tedious.TYPES.VarChar, application.Workshop_Name);
        request.addParameter("user_name", tedious.TYPES.VarChar, application.User_Name);
        return new Promise((resolve, reject) => { 
            let result: number;
            request.on("row", (column: Record<string, tedious.ColumnValue>): void => {
                result=column[0].value
            });
            request.on("error", error => reject(error));
            request.on("doneProc", () => resolve(result));
            connection.execSql(request);
        })
    }
    static async findAll(): Promise<Application[]> {
        const request = new tedious.Request("SELECT * FROM Applications", (error: Error, rowCount: number): void => {
        });
        const connection = await initializeDB();
        return new Promise((resolve, reject) => {
            let result: Application[] = [];
            request.on("row", (column: Record<string, tedious.ColumnValue>): void => {
                let temp: any = {};
                temp["Application_Id"] = column[0].value;
                temp["Workshop_Name"] = column[1].value;
                temp["User_Name"] = column[2].value;
                result.push(temp as Application)
            });
            request.on("error", error => reject(error));
            request.on("doneProc", () => resolve(result));
            connection.execSql(request)
        })
    }
}