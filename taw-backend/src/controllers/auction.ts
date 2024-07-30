import {Request, Response} from 'express';
import {z} from 'zod';
import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../secret';
import connectDB from "../../config/db";
import BadRequestException from "../exceptions/bad-request";
import Course from "../../models/course";
import UnauthorizedException from "../exceptions/unauthorized";
import InternalException from "../exceptions/internal-exception";
import Auction from "../../models/auction";
import Book from "../../models/book";
// TODO caricare le immagini e gestirle
// https://chatgpt.com/share/c6a5221d-83d5-444b-8939-920f39c2d22e

// TODO controllare se la data di inizio è minore di quella di fine

const formValidator = z.object({
    title: z.string(),
    year: z.number().optional(),
    ISBN: z.string(),
    condition: z.enum(['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor']),
    //auction_duration: z.number(),
    start_date: z.date(),
    end_date: z.date(),
    starting_price: z.number(),
    reserve_price: z.number(),
    description: z.string().optional(),
    course_id: z.string()
}).refine(data => data.start_date < data.end_date, {
    message: "End date must be greater than start date", path: ['start_date','end_date']
}).refine(data => data.ISBN.length === 10 || data.ISBN.length === 13, {
    message: "ISBN not valid", path: ['ISBN']
});

const validateForm = (req: Request, res: Response, input: unknown) => {
    try {
        formValidator.parse(input);
        return true;
    } catch (e) {
        if (e instanceof z.ZodError){
            let errors = e.errors.map(err => err.message);
            return BadRequestException(req, res, errors.join("; "));
        }
        else
            return BadRequestException(req, res, "Invalid input");
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

export const newAuctionController = async (req: Request, res: Response) => {
    try{
        req.body.start_date = new Date(req.body.start_date);
        req.body.end_date = new Date(req.body.end_date);
    }catch (e){
        return BadRequestException(req, res, "Invalid date format");
    }
    validateForm(req, res, req.body);

    await connectDB();

    const {
        title,
        year,
        ISBN,
        condition,
        start_date,
        end_date,
        starting_price,
        reserve_price,
        description,
        course_id
    } = req.body;

    /* const alreadyExistingBook = await Auction.findOne({ISBN: ISBN});
    commented out because we don't want use already created books

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

        const book = await Book.create({
            title,
            year,
            ISBN
        });

        await book.save();

        const auction = await Auction.create({
            book: book._id,
            condition,
            start_date,
            end_date,
            starting_price,
            reserve_price,
            description,
            seller: user_id,
            course: course_id
        });

        await auction.save();

        alreadyExistingCourse.auctions.push(auction);
        await alreadyExistingCourse.save();

        res.sendStatus(201);

    } catch (err) {
        console.log(err);
        return InternalException(req, res, "Unknkown error while creating listing");
    }
}