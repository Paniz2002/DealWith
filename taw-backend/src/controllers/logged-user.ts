import {Response} from "express";
import {JWT_SECRET} from "../secret";
import UserModel from "../../models/user";
import connectDB from "../config/db";
import * as jwt from "jsonwebtoken";
import UnauthorizedException from "../exceptions/unauthorized";

export const profileController = async (req: any, res: Response) => {
    await connectDB();
    // Should be guaranteed by the checkAutenticationMiddleware.
    const token = req.cookies.jwt;
    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const user = await UserModel.findOne({
            _id: payload._id,
        }).populate("email");
        if (!user) {
            return UnauthorizedException(req, res, "Unauthorized: Invalid JWT");
        }
        let response_json = {
            _id: user.id,
            username: user.username,
            is_moderator: user.isModerator(),
            needs_update:
                user.isModerator() &&
                user.createdAt.getTime() === user.updatedAt.getTime(),
            email_address: user.email.address,
        };
        return res.status(200).json(response_json);
    } catch (error) {
        console.error("Error", error);
        return UnauthorizedException(req, res, "Unauthorized: Unknown error.");
    }
};
