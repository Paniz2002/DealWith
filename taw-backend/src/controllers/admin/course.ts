import { Request, Response } from "express";
import connectDB from "../../config/db";
import InternalException from "../../exceptions/internal-exception";
import Course from "../../../models/course";
export const getCoursesController = async (req: Request, res: Response) => {};

export const postCoursesController = async (req: Request, res: Response) => {
  try {
    connectDB();
    const { name, university, year1, year2 } = req.body;
    await Course.create({
      name: name,
      university: university,
      year: { year1: year1, year2: year2 },
    });
    return res.sendStatus(200);
  } catch (err) {
    return InternalException(req, res, "Unknown error while creating");
  }
};
