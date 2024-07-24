import { Request, Response } from "express";
import connectDB from "../../../config/db";
import UserModel from "../../../models/user";
import BadRequestException from "../../exceptions/bad-request";
export const getStudentsController = async (req: Request, res: Response) => {
  connectDB();
  const filters = {
    role: "student",
  };
  const select = "_id username profile";
  const students = await UserModel.find(filters, select).exec();
  return res.status(200).json(students);
};

export const deleteStudentsController = async (req: Request, res: Response) => {
  await connectDB();
  const { userIDs } = req.body;
  // First we have to check if for some reason there's a moderator to be deleted.
  userIDs.forEach(async (userID: String) => {
    let user = await UserModel.findById({ _id: userID }, "role");
    if (user.isModerator())
      return BadRequestException(req, res, "Bad request: Invalid user IDs");
  });
  await UserModel.deleteMany({ _id: { $in: userIDs } });
  return res.sendStatus(200);
};
