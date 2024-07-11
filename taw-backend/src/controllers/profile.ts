import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import UserModel from "../../models/user";
import InternalException from "../exceptions/internal-exception";
import BadRequestException from "../exceptions/bad-request";
export const updateProfileController = (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword || currentPassword === newPassword) {
    return BadRequestException(req, res, "Invalid credentials.");
  }
  const update = {};
  const jwtToken = req.cookies.jwt;
  const jwtBody = jwt.verify(jwtToken, JWT_SECRET) as any;

  const userID = jwtBody._id;
  try {
    UserModel.updateOne(
      {
        _id: userID,
      },
      update,
      {
        runValidators: true,
      },
    );
  } catch (e) {
    return InternalException(req, res, "Unknown error while updating profile.");
  }
};
