import {Request, Response} from "express";
import connectDB from "../config/db";
import University from "../../models/university";
import Course from "../../models/course";
import City from "../../models/city";
import BadRequestException from "../exceptions/bad-request";
import fullTextSearch from "../utils/search";

/*
 * GET /api/courses
 * @params university: String University to be searched.
 * @params course: String Course to be searched.
 */
export const getCoursesController = async (req: Request, res: Response) => {
    try {
        await connectDB();
        let result = [];
        if (req.query && req.query.q) { //search by name of course and university and city
            result = await fullTextSearch(Course, req.query.q as string, "-_id -__v").populate({
                path: "university",
                model: University,
                select: "name city -_id",
                populate: {
                    path: "city",
                    model: City,
                    select: "name province country -_id",
                },
            }).exec();

        } else {
            result = await Course.find({}, "-_id -__v")
                .populate({
                    path: "university",
                    model: University,
                    select: "name city -_id",
                    populate: {
                        path: "city",
                        model: City,
                        select: "name province country -_id",
                    },
                }).exec();
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
        console.log(e);
        return res.status(500).send("Internal Server Error");
    }
    /*
        let {university, course} = req.query;
        if (university == undefined && course == undefined) { //get all courses with universities
            const result = await Course.find({}, "-_id -__v")
                .populate({
                    path: "university",
                    model: University,
                    select: "name city -_id",
                });
            return res.status(200).json(result);
        }
        if (university && !course) {
            const result = await fullTextSearch(
                University,
                university as string,
                "-_id -__v",
            )
                .populate({
                    path: "city",
                    model: City,
                    select: "name province country -_id",
                })
                .populate({
                    path: "courses",
                    model: Course,
                    select: "name year -_id",
                })
                .exec();
            return res.status(200).json(result);
        }
        if (course && !university) {
            const result = await fullTextSearch(
                Course,
                course as string,
                "-_id -__v",
            )
                .populate({
                    path: "university",
                    model: University,
                    select: "name city -_id",
                }).populate({
                    path: "city",
                    model: City,
                    select: "name province country -_id",
                })
                .exec()
            return res.status(200).json(result);
        }
        //create 2 queries and merge them in and using fullTextSearch
        const universities = await fullTextSearch(
            University,
            university as string,
            "-_id -__v",
        )
            .populate({
                path: "city",
                model: City,
                select: "name province country -_id",
            });
        const courses = await fullTextSearch(
            Course,
            course as string,
            "-_id -__v",
        )
            .populate({
                path: "university",
                model: University,
                select: "name city -_id",
            }).populate({
                path: "city",
                model: City,
                select: "name province country -_id",
            });
        const result = universities.concat(courses);
        return res.status(200).json(result); */


};
export const postCoursesController = (req: Request, res: Response) => {
};
