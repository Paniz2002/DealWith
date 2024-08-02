import { Request, Response } from "express";
import InternalException from "../exceptions/internal-exception";
import Book from "../../models/book";
import NotFoundException from "../exceptions/not-found";
import fullTextSearch from "../utils/search";
import { QueryWithHelpers } from "mongoose";
import { z } from "zod";
import BadRequestException from "../exceptions/bad-request";

//take only id, name year and ISBN
function mapBooks(
  books: QueryWithHelpers<Array<any>, any, any, any, "find", any>,
) {
  return books.map((book: { _id: any; title: any; year: any; ISBN: any }) => {
    return {
      id: book._id,
      title: book.title,
      year: book.year,
      ISBN: book.ISBN,
    };
  });
}

export const searchBooks = async (text: any, req: Request, res: Response) => {
  try {
    let books = await fullTextSearch(Book, text);
    if (!books) {
      return NotFoundException(req, res, "No books found.");
    }
    return res.status(200).json(mapBooks(books));
  } catch (err) {
    return InternalException(req, res, "Unknown error while searching books.");
  }
};

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

const formValidator = z
  .object({
    title: z.string(),
    year: z.number(),
    ISBN: z.string(),
  })
  .refine((data) => data.ISBN.length === 10 || data.ISBN.length === 13, {
    message: "ISBN not valid",
    path: ["ISBN"],
  });

export const addBook = async (req: Request, res: Response) => {
  try {
    const { title, year, ISBN } = req.body;
    const alreadyExistingBook = await Book.findOne({ ISBN: ISBN });
    if (alreadyExistingBook) {
      return BadRequestException(req, res, "Book already exists");
    }
    const book = await Book.create({
      title: title,
      year: year,
      ISBN: ISBN,
    });
    await book.save();
    return res.status(200).json({
      id: book._id,
      title: book.title,
      year: book.year,
      ISBN: book.ISBN,
    });
  } catch (err) {
    console.log(err);
    return InternalException(req, res, "Unknown error while adding book.");
  }
};
