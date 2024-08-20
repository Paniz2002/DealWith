import User from "../../models/user";

import {Request, Response} from "express";
import {getUserId} from "../utils/userID";
import {io} from "../index";
import InternalException from "../exceptions/internal-exception";
import BadRequestException from "../exceptions/bad-request";

export function sendNotification(room: string) {
    console.log(`Sending notification to room: ${room}`);
    getUnreadNotificationsController(room).then((notifications) => {
        io.to(room).emit('notification', notifications);
    })
}

async function getUnreadNotificationsController(user_id: string) {
    try {
        let user = await User.findById(user_id)
        if (!user) {
            console.warn("User not found with id: " + user_id);
            return [];
        }
        return user.getToReadNotifications();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        const user_id = getUserId(req, res);
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