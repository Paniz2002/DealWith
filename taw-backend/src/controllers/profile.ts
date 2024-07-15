import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import UserModel from "../../models/user";
import InternalException from "../exceptions/internal-exception";
import BadRequestException from "../exceptions/bad-request";
import { compareSync, hashSync } from "bcryptjs";

interface UpdateProfile {
  password?: string;
  updatedAt: Date;
}
export const updateProfileController = async (req: Request, res: Response) => {
  const { oldPassword, password, confirmPassword } = req.body;
  if (oldPassword === password || password !== confirmPassword) {
    return BadRequestException(req, res, "Invalid credentials.");
  }
  const update: UpdateProfile = {
    updatedAt: new Date(),
  };
  const jwtToken = req.cookies.jwt;
  const jwtBody = jwt.verify(jwtToken, JWT_SECRET) as any;
  const userID = jwtBody._id;
  if (password !== undefined) {
    // We have to do this by hand because mongoose does not support
    // .pre on update, only on creation and when we do .save()
    update.password = hashSync(password, 10);
  }
  try {
    const user = await UserModel.findById(userID).exec();
    if (!user || !compareSync(oldPassword, user.password)) {
      return BadRequestException(req, res, "Invalid credentials.");
    }

    await UserModel.updateOne({ _id: userID }, update, {
      runValidators: true,
    });

    return res.sendStatus(200);
  } catch (e) {
    return InternalException(req, res, "Unknown error while updating profile.");
  }
};
