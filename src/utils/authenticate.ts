import dotenv = require('dotenv');
dotenv.config();
import jwt, { Secret,JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface CustomRequest extends Request {
 token: JwtPayload;
}
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            res.status(403).json({ output: "fail", msg: "No Authtorization Given" })
            return;
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;
        (req as CustomRequest).token = decoded;

        next();
    } catch (err) {
        res.status(401).json({output:"fail",msg:"Error In Authtorization"})
    }
};
export const authenticateJWTLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            if (req.body.user_email && req.body.password) {
                
                next()
            }
            else{
                res.status(403).json({ output: "fail", msg: "No Authtorization Given" })
            }
            return;
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;
        (req as CustomRequest).token = decoded;

        res.status(200).json({output:"success",msg:"Logged in using token"})
    } catch (err) {
        console.log(err)
        res.status(401).json({output:"fail",msg:"Error In Authtorization"})
    }
};