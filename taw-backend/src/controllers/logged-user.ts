import { Response } from "express";
import { JWT_SECRET } from "../secret";
import UserModel from "../../models/user";
import connectDB from "../../config/db";
import * as jwt from "jsonwebtoken";
import UnauthorizedException from "../exceptions/unauthorized";

export const profileController = async (req: any, res: Response) => {
  connectDB();
  // Should be guaranteed by the checkAutenticationMiddleware.
  const token = req.cookies.jwt;
  try {
    // If token is present, decode the token and extract the payload
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await UserModel.findOne({
      _id: payload._id,
    }).populate("email");
    if (!user) {
      return UnauthorizedException(req, res, "Unauthorized: Invalid JWT");
    }
    let response_json = {
      username: user.username,
      is_moderator: user.isModerator(),
      needs_update:
        user.isModerator() &&
        user.createdAt.getTime() === user.updatedAt.getTime(),
      email_address: user.email.address,
    };
    return res.json(response_json);
  } catch (error) {
    return UnauthorizedException(req, res, "Unauthorized: Unknown error.");
  }
};
