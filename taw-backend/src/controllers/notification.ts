import User from "../../models/user";

import {Request, Response} from "express";
import {getUserId} from "../utils/userID";
import InternalException from "../exceptions/internal-exception";
import BadRequestException from "../exceptions/bad-request";
import connectDB from "../config/db";

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        const user_id = getUserId(req, res);
        await connectDB();
        const user = await User.findById(user_id);

        if(!user){
            return BadRequestException(req, res, "User not found");
        }

        if(!user.notifications){
            return res.status(200).json([]);
        }

        return res.status(200).json(user.notifications);
    } catch (e) {
        return InternalException(req, res, "Error while getting notifications");
    }
};