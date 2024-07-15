import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import UserModel from "../../models/user";
import InternalException from "../exceptions/internal-exception";
import BadRequestException from "../exceptions/bad-request";
import { compareSync } from "bcryptjs";
export const updateProfileController = (req: Request, res: Response) => {
  const { oldPassword, password, confirmPassword } = req.body;
  if (oldPassword === password || password !== confirmPassword) {
    return BadRequestException(req, res, "Invalid credentials.");
  }
  // I don't like this.
  // TODO: create interface when we're all done with this project.
  const update = {} as any;
  const jwtToken = req.cookies.jwt;
  const jwtBody = jwt.verify(jwtToken, JWT_SECRET) as any;
  const userID = jwtBody._id;
  if (password !== undefined) {
    update.password = password;
  }
  try {
    UserModel.findById(userID)
      .exec()
      .then((user) => {
        if (compareSync(oldPassword, user.password)) {
          UserModel.updateOne(
            {
              _id: userID,
            },
            update,
            {
              runValidators: true,
            },
          );
          return res.sendStatus(200);
        } else return BadRequestException(req, res, "Invalid credentials.");
      });
  } catch (e) {
    return InternalException(req, res, "Unknown error while updating profile.");
  }
};
