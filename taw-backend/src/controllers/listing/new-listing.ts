import {Request, Response} from 'express';
import {z} from 'zod';
import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../../secret';
import connectDB from "../../../config/db";
import BadRequestException from "../../exceptions/bad-request";
import Course from "../../../models/course";
import UnauthorizedException from "../../exceptions/unauthorized";
import InternalException from "../../exceptions/internal-exception";
import Auction from "../../../models/auction";

// TODO caricare le immagini e gestirle
// https://chatgpt.com/share/c6a5221d-83d5-444b-8939-920f39c2d22e

// TODO controllare se la data di inizio è minore di quella di fine

const formValidator = z.object({
    title: z.string(),
    year: z.number().optional(),
    ISBN: z.string().length(10),
    condition: z.enum(['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor']),
    //auction_duration: z.number(),
    start_date: z.date(),
    end_date: z.date(),
    starting_price: z.number(),
    reserve_price: z.number(),
    description: z.string().optional(),
    course_id: z.string()
});

const validateForm = (input: unknown) => {
    try {
        formValidator.parse(input);
        return true;
    } catch (e) {
        return false;
    }
}

const getUserId = (req: Request, res: Response) => {
    const token = req.cookies.jwt;
    if (!token) {
        return BadRequestException(req, res, "Bad Request: Missing JWT");
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        return payload._id;
    } catch (e) {
        return UnauthorizedException(req, res, "Unauthorized: Invalid JWT");
    }
}

export const newListingController = async (req: Request, res: Response) => {
    if (!validateForm(req.body)) {
        return BadRequestException(req, res, 'Invalid input');
    }

    await connectDB();

    const {
        title,
        year,
        ISBN,
        condition,
        start_date,
        end_date,/*auction_duration*/
        starting_price,
        reserve_price,
        description,
        course_id
    } = req.body;


    const alreadyExistingBook = await Auction.findOne({ISBN: ISBN});

    /* commented out because we don't want use already created books
    if (alreadyExistingBook) {
         return BadRequestException( req, res, 'Book already exists')
      }
      */


    const alreadyExistingCourse = await Course.findOne({_id: course_id});

    if (!alreadyExistingCourse) {
        return BadRequestException(req, res, 'Course does not exist')
    }

    try {
        const user_id = getUserId(req, res);

        const book = await Auction.create({
            title,
            year,
            ISBN,
            condition,
            start_date,
            end_date,
            starting_price,
            reserve_price,
            description,
            course: course_id,
            seller: user_id
        });

        await book.save();

        alreadyExistingCourse.books.push(book);
        await alreadyExistingCourse.save();

        res.sendStatus(201);

    } catch (err) {
        return InternalException(req, res, "Unknkown error while creating listing");
    }
}