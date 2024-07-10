import {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {JWT_SECRET} from "../schema/secret";
import BadRequestException from "../exceptions/bad-request";
import NotFoundException from "../exceptions/not-found";
import UserModel from "../../models/user";
import connectDB from "../../config/db";

export const loginController = async (req: Request, res: Response) => {

    connectDB();

    const {username, password} = req.body;

    let user = await UserModel.findOne({
        'username': username
    });
    if (!user) {
        return NotFoundException(req, res, "User does not exists");
    }

    if (!user.comparePassword(password)) {
        return BadRequestException(req, res, "Invalid Password");
    }

    let response_json = {
        _id: user.id,
        username: user.username,
        is_moderator: user.isModerator(),
        needs_update: user.isModerator() && (user.createdAt.getTime() === user.updatedAt.getTime())
    };

    const token = jwt.sign(
        response_json,
        JWT_SECRET,
    );
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    return res.json(response_json);
};
