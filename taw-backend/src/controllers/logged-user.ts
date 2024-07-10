import {Response} from "express";
import {JWT_SECRET} from "../secret";
import {verify} from "jsonwebtoken";
import UserModel from "../../models/user";
import connectDB from "../../config/db";
import BadRequestException from "../exceptions/bad-request";
import * as jwt from "jsonwebtoken";
import UnautorizedException from "../exceptions/unauthorized";

export const loggedUserController = async (req: any, res: Response) => {
    connectDB();
    //  1.   extract the token from header
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
        const user = await UserModel.findOne({
            '_id': payload._id
        }).populate('email_id');
        if (!user) {
            return UnautorizedException(req, res, "Unauthorized: Invalid JWT");
        }
        let response_json = {
            username: user.username,
            is_moderator: user.isModerator(),
            needs_update: user.isModerator() && (user.createdAt.getTime() === user.updatedAt.getTime()),
            email_address: user.email_id.address
        };
        return res.json(response_json);
    } catch (error) {
        console.log(error)
        return UnautorizedException(req, res, "Unauthorized: Unknown error.");
    }

};
