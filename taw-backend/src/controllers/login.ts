import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import BadRequestException from "../exceptions/bad-request";
import NotFoundException from "../exceptions/not-found";
import UserModel from "../../models/user";
import connectDB from "../../config/db";

export const loginController = async (req: Request, res: Response) => {
  connectDB();

  const { username, password } = req.body;

  let user = await UserModel.findOne({
    username: username,
  });
  if (!user || !user.comparePassword(password)) {
    return BadRequestException(req, res, "Invalid credentials.");
  }

  let response = {
    _id: user.id,
    username: user.username as string,
    is_moderator: user.isModerator(),
    needs_update: user.createdAt.getTime() === user.updatedAt.getTime(),
  };

  const jwtToken = jwt.sign(response, JWT_SECRET);
  res.cookie("jwt", jwtToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  return res.json(response);
};
