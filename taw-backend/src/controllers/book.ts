import { Request, Response } from "express";
import connectDB from "../../config/db";

import InternalException from "../exceptions/internal-exception";
import Book from "../../models/book";

async function searchBooks(to_search: string | undefined) {
  await connectDB();
  try {
    let books = null;
    if (to_search) {
      books = await Book.find({
        $text: { $search: to_search },
      });
    } else {
      books = await Book.find();
    }
    if (books && books.length > 0) {
      //take only id, name year and ISBN
      return books.map((book) => {
        return {
          id: book._id,
          title: book.title,
          year: book.year,
          ISBN: book.ISBN,
        };
      });
    }
  } catch (err) {
    console.error("Error performing search:", err);
    throw err;
  }
}

export const getBooksController = async (req: Request, res: Response) => {
  try {
    let to_search = req.query.q;
    if (to_search) {
      to_search = to_search.toString();
    }
    const books = await searchBooks(to_search);
    return res.status(200).json(books);
  } catch (err) {
    return InternalException(req, res, "Unknown error while creating listing");
  }
};
