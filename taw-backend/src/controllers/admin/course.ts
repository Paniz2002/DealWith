import { Request, Response } from "express";
import connectDB from "../../config/db";
import InternalException from "../../exceptions/internal-exception";
import Course from "../../../models/course";
import BadRequestException from "../../exceptions/bad-request";

import { z } from "zod";
import { validateForm } from "../../utils/validate";
export const postCoursesController = async (req: Request, res: Response) => {
  try {
    connectDB();
    const { name, university, year1, year2 } = req.body;
    const valid = validateForm(
      req,
      res,
      req.body,
      z
        .object({
          name: z.string().min(1),
          university: z.string().min(1),
          year1: z.number(),
          year2: z.number(),
        })
        .refine((years) => years.year2 === years.year1 + 1, {
          message: "year2 must be equal to year1 + 1",
          path: ["year2"], // This indicates where the error should be reported
        }),
    );
    if (!valid) {
      console.log(req.body);
      return BadRequestException(req, res, "Bad request: invalid input");
    }
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
