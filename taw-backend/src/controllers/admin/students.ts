import { Request, Response } from "express";
import connectDB from "../../../config/db";
import UserModel from "../../../models/user";
import BadRequestException from "../../exceptions/bad-request";
// TODO: this is in common between frontend and backend
// maybe we can have it in the same file.
interface Student {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
}
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
  const { users } = req.body;
  // First we have to check if for some reason there's a moderator to be deleted.
  for await (const user of users) {
    let u = await UserModel.findById({ _id: user._id });
    if (u.isModerator())
      return BadRequestException(req, res, "Bad request: Invalid user IDs");
  }
  // Then we can delete every user on the array if there were no problems.
  for await (const user of users) {
    await UserModel.deleteOne({ _id: user._id });
  }
  return res.sendStatus(200);
};
