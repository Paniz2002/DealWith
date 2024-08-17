import {Request, Response} from "express";
import connectDB from "../config/db";
import University from "../../models/university";
import Course from "../../models/course";
import City from "../../models/city";
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
            result = await fullTextSearch(Course, req.query.q as string )

        } else {
            result = result = await fullTextSearch(Course, "" )
        }
        if (result.length) { //map the result to the required format
            result = result.map((course: any) => {
                return {
                    _id: course._id,
                    name: course.name,
                    year1: course.year.year1,
                    year2: course.year.year2,
                    university: course.university.name,
                    city: course.university.city,
                };
            });
        }
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Internal Server Error");
    }

};
export const postCoursesController = (req: Request, res: Response) => {
};
