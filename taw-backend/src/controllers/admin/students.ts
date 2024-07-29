import { Request, Response } from "express";
import connectDB from "../../../config/db";
import UserModel from "../../../models/user";
import InternalException from "../../exceptions/internal-exception";
export const getStudentsController = async (req: Request, res: Response) => {
  await connectDB();
  const filters = {
    role: "student",
  };
  const select = "_id username profile";
  const students = await UserModel.find(filters, select).exec();
  return res.status(200).json(students);
};

export const deleteStudentsController = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { users } = req.body;
    for await (const user of users) {
      let u = await UserModel.findById({ _id: user._id });
      if (!u.isModerator()) await UserModel.deleteOne({ _id: user._id });
    }
    return res.sendStatus(200);
  } catch (err) {
    return InternalException(
      req,
      res,
      "Unknown error while deleting students.",
    );
  }
};
