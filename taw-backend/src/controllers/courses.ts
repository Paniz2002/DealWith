import { Request, Response } from "express";
import connectDB from "../config/db";
import University from "../../models/university";
import Course from "../../models/course";
import City from "../../models/city";
import BadRequestException from "../exceptions/bad-request";
import fullTextSearch from "../utils/search";
interface UniversityResult {
  _id: string | null;
  name: string;
  city: string;
  courses: string[];
  __v: number;
}
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
  university = university as string;
  course = course as string;
  await connectDB();
  if (university) {
    const result = await fullTextSearch(University, university)
      .populate({
        path: "city",
        model: City,
        select: "name province country -_id",
      })
      .populate({
        path: "courses",
        model: Course,
        select: "name year1 year2 -_id",
      })
      .exec();
    return res.status(200).json(result);
  }
  if (course) {
  }
};
export const postCoursesController = (req: Request, res: Response) => {};
