import {Request, Response} from 'express';
import connectDB from "../../config/db";

import InternalException from "../exceptions/internal-exception";
import Book from "../../models/book";
import NotFoundException from "../exceptions/not-found";
import {fullTextSearch} from "../index";
import {QueryWithHelpers} from "mongoose";


/*
async function searchBooks(req:Request, res:Response,to_search: string | undefined) {
    await connectDB();
    try {
        let books = null;
        if (to_search) {
            books = await Book.find({
                $text: {$search: to_search}
            });

            if(!books)
                return NotFoundException(req, res, "No books found.");
        } else {
            books = await Book.find();
        }
        if(books && books.length > 0) {
            //take only id, name year and ISBN
            return books.map((book) => {
                return {
                    id: book._id,
                    title: book.title,
                    year: book.year,
                    ISBN: book.ISBN
                }
            });
        }
    } catch (err) {
        return InternalException(req, res, "Unknown error while searching books.");
    }

}
*/

function mapBooks(books: QueryWithHelpers<Array<any>, any, any, any, 'find', any>) {
    return books.map((book: { _id: any; title: any; year: any; ISBN: any; }) => {
        return {
            id: book._id,
            title: book.title,
            year: book.year,
            ISBN: book.ISBN
        }
    });
}

export const searchBooks = async (text: any, req: Request, res: Response) => {
    try {
        let books = await fullTextSearch(Book, text);
        if(!books){
            return NotFoundException(req, res, "No books found.");
        }
        //take only id, name year and ISBN
       return res.status(200).json(mapBooks(books));
    } catch (err) {
        return InternalException(req, res, "Unknown error while searching books.");
    }
}

export const getBooks = async (req: Request, res: Response) => {
    try {
        const q = req.query.q;
        if (q) {
            return searchBooks(q, req, res);
        }
        const books = await Book.find();
        return res.status(200).json(mapBooks(books));
    } catch (err) {
        return InternalException(req, res, "Unknown error while getting books.");
    }
};
