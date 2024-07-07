import { Request, Response } from "express";
import bcrypt, { compareSync } from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../schema/secret";
import BadRequestException from "../exceptions/bad-request";
import NotFoundException from "../exceptions/not-found";
import UserModel from "../../models/user";
import connectDB from "../../config/db";

export const loginController = async (req: Request, res: Response) => {

  connectDB();

  const { username, password } = req.body;

  let user = await UserModel.findOne({
    'username':req.body.username
  });
  if (!user) {
    return NotFoundException(req, res, "User does not exists");
  }

  if (!user.comparePassword (password)) {
    return BadRequestException(req, res, "Invalid Password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_SECRET,
  );

  return res.json({ token });
};
