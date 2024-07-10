import {Request, Response, NextFunction} from "express";
import UnautorizedException from "../exceptions/unauthorized";
import * as jwt from "jsonwebtoken";
import {JWT_SECRET} from "../secret";
import BadRequestException from "../exceptions/bad-request";
import UserModel from "../../models/user";
import connectDB from "../../config/db";


const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    connectDB();
    //  1.   extract the token from header

    console.log(req.cookies)
    const token = req.cookies.jwt;

    //  2.   if token is not present, throw a bad request exception.
    if (!token) {
        // Next prints to console ... because reasons.
        // So i modified it accordingly
        return BadRequestException(req, res, "Bad Request: Missing JWT");
    }
    try {
        //  3.   if token is present, decode the token and extract the payload
        const payload = jwt.verify(token, JWT_SECRET) as any;
        console.log(payload);
        const user = await UserModel.exists({
            '_id': payload._id
        });
        if (!user) {
            return UnautorizedException(req, res, "Unauthorized: Invalid JWT");
        }
        return next();
    } catch (error) {
        return UnautorizedException(req, res, "Unauthorized: Unknown error.");
    }


};
export default authMiddleware;
