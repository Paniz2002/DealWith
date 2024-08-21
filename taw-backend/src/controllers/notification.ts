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

        return res.status(200).json(user.getVisibleNotifications());
    } catch (e) {
        return InternalException(req, res, "Error while getting notifications");
    }
};
export const setNotificationReadController = async (req: Request, res: Response) => {
    try {
        const user_id = getUserId(req, res);
        await connectDB();
        const user = await User.findById(user_id);

        if(!user){
            return BadRequestException(req, res, "User not found");
        }

        const notification_id = req.params.id;
        const notification = user.notifications.find((notification: { _id: { toString: () => string; }; }) => notification._id.toString() === notification_id);

        if(!notification){
            return BadRequestException(req, res, "Notification not found");
        }

        notification.isRead = true;
        await user.save();

        return res.status(200).json(notification);
    } catch (e) {
        return InternalException(req, res, "Error while setting notification as read");
    }
}

export const deleteNotificationController = async (req: Request, res: Response) => {
    try {
        const user_id = getUserId(req, res);
        await connectDB();
        const user = await User.findById(user_id);

        if(!user){
            return BadRequestException(req, res, "User not found");
        }

        const notification_id = req.params.id;
        const notification = user.notifications.find((notification: { _id: { toString: () => string; }; }) => notification._id.toString() === notification_id);

        if(!notification){
            return BadRequestException(req, res, "Notification not found");
        }

        notification.isVisible = false;
        await user.save();

        return res.status(200).json(notification);
    } catch (e) {
        return InternalException(req, res, "Error while setting notification as read");
    }
}