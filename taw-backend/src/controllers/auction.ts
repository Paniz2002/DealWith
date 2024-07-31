import {Request, Response} from 'express';
import {z} from 'zod';
import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../secret';
import connectDB from "../config/db";
import BadRequestException from "../exceptions/bad-request";
import Course from "../../models/course";
import UnauthorizedException from "../exceptions/unauthorized";
import InternalException from "../exceptions/internal-exception";
import Auction from "../../models/auction";
import Book from "../../models/book";
import User from "../../models/user";
import {getUserId, validateForm} from "../index";
// TODO caricare le immagini e gestirle
// https://chatgpt.com/share/c6a5221d-83d5-444b-8939-920f39c2d22e

const formValidator = z.object({
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
});





export const newAuctionController = async (req: Request, res: Response) => {
    try{
        req.body.start_date = new Date(req.body.start_date);
        req.body.end_date = new Date(req.body.end_date);
    }catch (e){
        return BadRequestException(req, res, "Invalid date format");
    }
    validateForm(req, res, req.body, formValidator);

    await connectDB();

    const {
        condition,
        start_date,
        end_date,
        starting_price,
        reserve_price,
        description,
        book_id,
    } = req.body;


/*
    const alreadyExistingCourse = await Course.findOne({_id: course_id});

    if (!alreadyExistingCourse) {
        return BadRequestException(req, res, 'Course does not exist')
    }
    */


    try {
        const user_id = getUserId(req, res);



        const auction = await Auction.create({
            book: book_id,
            condition,
            start_date,
            end_date,
            starting_price,
            reserve_price,
            description,
            seller: user_id,
        });

        await auction.save();

        /* alreadyExistingCourse.auctions.push(auction);
        await alreadyExistingCourse.save(); */

        res.sendStatus(201);

    } catch (err) {
        console.log(err);
        return InternalException(req, res, "Unknkown error while creating listing");
    }
}



export const uploadAuctionImagesController = async (req: Request, res: Response) => {
    if(!req.files){
        return BadRequestException(req, res, "No images uploaded");
    }

    console.log(req.files);

    const {auction_id, seller_id} = req.body;

    if(!auction_id || !seller_id){
        return BadRequestException(req, res, "Missing auction_id or user_id");
    }

    const auction = await Auction.findById(auction_id);
    const user = await User.findById(seller_id);
    if(!auction || !user){
        return BadRequestException(req, res, "Auction or user not found");
    }

    const user_id = getUserId(req, res);

    if(auction.seller.toString() !== seller_id){
        return BadRequestException(req, res, "The seller is not the owner of the auction");
    }

    if(auction.seller.toString() !== user_id){
        return UnauthorizedException(req, res, "Unauthorized: You are not the seller of this auction");
    }
    // TODO aggiungere i path delle immagini alle auction nel db



    return res.status(200).send("Images uploaded");
}