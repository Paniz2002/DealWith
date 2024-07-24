import e, { Request, Response } from "express";
import connectDB from "../../../config/db";
import UserModel from "../../../models/user";
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
};
