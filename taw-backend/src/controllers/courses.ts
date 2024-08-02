import { Request, Response } from "express";
import connectDB from "../config/db";
import University from "../../models/university";
import Course from "../../models/course";
import BadRequestException from "../exceptions/bad-request";
import fullTextSearch from "../utils/search";
/*
 * GET /api/courses
 * @params university: String University to be searched.
 * @params course: String Course to be searched.
 */
export const getCoursesController = async (req: Request, res: Response) => {
  let { university, course } = req.query;
  if (university == undefined && course == undefined) {
    return BadRequestException(req, res, "Bad request: Invalid parameters.");
  }
  await connectDB();
  if (university) {
    const result = await fullTextSearch(
      University,
      university as string,
      "-_id -__v",
    )
      .populate({
        path: "city",
        select: "name province country -_id",
      })
      .populate({
        path: "courses",
        model: Course,
        select: "-_id -year._id -university -auctions -books -__v",
      })
      .exec();
    return res.status(200).json(result);
  }
  if (course) {
  }
};
export const postCoursesController = (req: Request, res: Response) => {};
