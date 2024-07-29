import { Request, Response } from "express";
import connectDB from "../../config/db";
import University from "../../models/university";
import { AggregateOptions, PipelineStage } from "mongoose";
import BadRequestException from "../exceptions/bad-request";
import Course from "../../models/course";
import InternalException from "../exceptions/internal-exception";

/*
 * GET /api/courses
 * @params university: String University to be searched.
 * @params course: String Course to be searched.
 */
export const getCoursesController = async (req: Request, res: Response) => {
  // Imagine doing { cityID : String } = req.body
  // Instead of doing this:
  const { university, course } = req.query;
  if (university == undefined && course == undefined) {
    return BadRequestException(req, res, "Bad request: invalid parameters.");
  }
  await connectDB();
  if (university) {
    try {
      const pipeline: PipelineStage[] = [
        { $match: { $text: { $search: university } } },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "university",
            as: "courses",
          },
        },
      ];

      const results = await University.aggregate(pipeline).exec();
      return res.status(200).json(results);
    } catch (error) {
      return InternalException(req, res, "Unknown error while retrieving data");
    }
  }

  if (course) {
    try {
      const pipeline = [
        { $match: { $text: { $search: course } } },
        {
          $lookup: {
            from: "universities",
            localField: "university",
            foreignField: "_id",
            as: "university",
          },
        },
        { $unwind: "$university" },
        {
          $lookup: {
            from: "courses",
            localField: "university._id",
            foreignField: "university",
            as: "allCourses",
          },
        },
      ];

      const results = await Course.aggregate(pipeline).exec();
      return res.status(200).json(results);
    } catch (error) {
      return InternalException(req, res, "Unknown error while retrieving data");
    }
  }
};
export const postCoursesController = (req: Request, res: Response) => {};
