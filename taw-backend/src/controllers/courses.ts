import {Request, Response} from "express";
import connectDB from "../config/db";
import University from "../../models/university";
import Course from "../../models/course";
import BadRequestException from "../exceptions/bad-request";
import fullTextSearch from "../utils/search";
/*
 * GET /api/courses
 * @params q: String to be searched.
 */
export const getCoursesController = async (req: Request, res: Response) => {

    try {
        await connectDB();
        let result = [];
        if (req.query && req.query.q) { //search by name of course and university and city
            result = await fullTextSearch(Course, req.query.q as string , "-__v")

        } else {
            result = result = await fullTextSearch(Course, "", "-__v")
        }

        if (result.length) { //map the result to the required format
            result = result.map((course: any) => {
                return {
                    id: course._id,
                    name: course.name,
                    year1: course.year.year1,
                    year2: course.year.year2,
                    university: course.university.name,
                    city: course.university.city.name,
                };
            });
        }
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Internal Server Error");
    }

};
export const postCoursesController = async (req: Request, res: Response) => {
    let {university, course} = req.query;
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
        return res.status(200).json(result);
    }
    if (course) {
    }
};
