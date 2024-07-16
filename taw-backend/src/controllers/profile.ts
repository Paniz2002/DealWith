import {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {JWT_SECRET} from "../secret";
import UserModel from "../../models/user";
import InternalException from "../exceptions/internal-exception";
import BadRequestException from "../exceptions/bad-request";

export const updateProfileController = async (req: Request, res: Response) => {
    const {oldPassword, password, confirmPassword} = req.body;
    if (oldPassword === undefined || password === undefined || confirmPassword === undefined) {
        return BadRequestException(req, res, "Missing required fields.");
    }
    if (oldPassword === password) {
        return BadRequestException(req, res, "Cannot use old password.");
    }
    if (password !== confirmPassword) {
        return BadRequestException(req, res, "Passwords do not match.");
    }
    const jwtToken = req.cookies.jwt;
    const jwtBody = jwt.verify(jwtToken, JWT_SECRET) as any;
    const userID = jwtBody._id;
    try {
        const user = await UserModel.findById(userID).exec();
        if (!user || !user.comparePassword(oldPassword)) {
            return BadRequestException(req, res, "Invalid credentials.");
        }
        user.password=password;
        await user.save();
        return res.sendStatus(200);
    } catch (e) {
        return InternalException(req, res, "Unknown error while updating profile.");
    }
};
