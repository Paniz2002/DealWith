import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import BadRequestException from "../exceptions/bad-request";
import UserModel from "../../models/user";
import connectDB from "../config/db";

export const loginController = async (req: Request, res: Response) => {
  await connectDB();

  const { username, password } = req.body;

  let user = await UserModel.findOne({
    username: username,
  });

  if (!user || !user.comparePassword(password)) {
    return BadRequestException(
      req,
      res,
      "Login failed; Invalid username or password.",
    );
  }

  let response = {
    _id: user.id,
    username: user.username as string,
    is_moderator: user.isModerator(),
    needs_update:
      user.isModerator() &&
      user.createdAt.getTime() === user.updatedAt.getTime(),
  };

  const jwtToken = jwt.sign(response, JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("jwt", jwtToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  return res.json(response);
};
