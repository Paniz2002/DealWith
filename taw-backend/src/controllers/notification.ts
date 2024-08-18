import connectDB from "../config/db";
import Auction from "../../models/auction";
import User from "../../models/user";

import {Request, Response} from "express";
import {getUserId} from "../utils/userID";

export const getNotificationsController = async (req: Request, res: Response) => {
    try{
        const user_id = getUserId(req,res);
        await connectDB();
        const user = await User.findById(user_id);
        res.status(200).json(user.notifications);
    }catch(e){
        console.error(e);
        res.status(500).json({message: "Internal server error"});
    }
};