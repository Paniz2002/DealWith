import { Request, Response } from "express";
import { z } from "zod";
import connectDB from "../config/db";
import BadRequestException from "../exceptions/bad-request";
import UnauthorizedException from "../exceptions/unauthorized";
import InternalException from "../exceptions/internal-exception";
import Auction from "../../models/auction";
import Book from "../../models/book";
import User from "../../models/user";
import { validateForm } from "../utils/validate";
import fullTextSearch from "../utils/search";
import { getUserId } from "../utils/userID";

const formValidator = z
  .object({
    condition: z.enum([
      "Mint",
      "Near Mint",
      "Excellent",
      "Good",
      "Fair",
      "Poor",
    ]),
    //auction_duration: z.number(),
    start_date: z.date(),
    end_date: z.date(),
    starting_price: z.number(),
    reserve_price: z.number(),
    description: z.string().optional(),
    book_id: z.string(),
  })
  .refine((data) => data.start_date < data.end_date, {
    message: "End date must be greater than start date",
    path: ["start_date", "end_date"],
  });

export const newAuctionController = async (req: Request, res: Response) => {
  try {
    req.body.start_date = new Date(req.body.start_date);
    req.body.end_date = new Date(req.body.end_date);
  } catch (e) {
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
};

export const uploadAuctionImagesController = async (
  req: Request,
  res: Response,
) => {
  if (!req.files) {
    return BadRequestException(req, res, "No images uploaded");
  }

  console.log(req.files);

  const { auction_id, seller_id } = req.body;

  if (!auction_id || !seller_id) {
    return BadRequestException(req, res, "Missing auction_id or user_id");
  }

  const auction = await Auction.findById(auction_id);
  const user = await User.findById(seller_id);
  if (!auction || !user) {
    return BadRequestException(req, res, "Auction or user not found");
  }

  const user_id = getUserId(req, res);

  if (auction.isOwner(user_id)) {
    return BadRequestException(
      req,
      res,
      "The seller is not the owner of the auction",
    );
  }

  if (auction.seller.toString() !== user_id) {
    return UnauthorizedException(
      req,
      res,
      "Unauthorized: You are not the seller of this auction",
    );
  }

  const files = req.files as Express.Multer.File[];
  try {
    for (const file of files) {
      const path = file.path;
      auction.images.push(path);
    }

    await auction.save();

    return res.status(200).send("Images uploaded");
  } catch (e) {
    return InternalException(req, res, "Error while saving images");
  }
};

const queryValidator = z.object({
  q: z.string().optional(),
  starting_price: z.number().optional(),
  reserve_price: z.number().optional(),
  condition: z
    .enum(["Mint", "Near Mint", "Excellent", "Good", "Fair", "Poor"])
    .optional(),
});

const getSuperiorConditions = function (currentCondition: string) {
  const conditions = ["Mint", "Near Mint", "Excellent", "Good", "Fair", "Poor"];

  const index = conditions.indexOf(currentCondition);
  if (index === -1) {
    throw new Error("Invalid condition");
  }
  return conditions.slice(0, index + 1);
};

const searchAuctions = async function (req: Request, res: Response) {
  try {
    const {
      q,
      min_starting_price,
      max_starting_price,
      min_reserve_price,
      max_reserve_price,
      min_condition,
      active,
    } = req.query;

    /* If min_condition is provided, get all conditions superior to it
     *  If not, the default superior_conditions are all conditions
     */
    let superior_conditions = [
      "Mint",
      "Near Mint",
      "Excellent",
      "Good",
      "Fair",
      "Poor",
    ];
    if (min_condition) {
      try {
        superior_conditions = getSuperiorConditions(min_condition.toString());
      } catch (e) {
        console.log(e);
        return BadRequestException(req, res, "Invalid condition");
      }
    }

    // If q is provided, search for books and auctions that match the query
    let searchedAuctions = [];
    const allAuctions = await Auction.find();
    if (q) {
      const books = await fullTextSearch(Book, q.toString());
      searchedAuctions = await fullTextSearch(Auction, q.toString());
      for (let auction of allAuctions) {
        const exists = books.find(
          (book) => book._id.toString() === auction.book.toString(),
        );

        if (exists && !searchedAuctions.includes(auction)) {
          searchedAuctions.push(auction);
        }
      }
      if (!searchedAuctions) {
        return BadRequestException(req, res, "No auctions found");
      }
    }

    /* Search for auctions based on the query parameters
     *  If no query parameters are provided, return all
     *  If q is provided, return only the auctions that match the query
     */
    let auctions = await Auction.find({
      $and: [
        {
          starting_price: min_starting_price
            ? { $gte: min_starting_price }
            : max_starting_price
              ? { $lte: max_starting_price }
              : min_starting_price && max_starting_price
                ? {
                    $gte: min_starting_price,
                    $lte: max_starting_price,
                  }
                : { $gte: 0 },
        },
        {
          reserve_price: min_reserve_price
            ? { $gte: min_reserve_price }
            : max_reserve_price
              ? { $lte: max_reserve_price }
              : min_reserve_price && max_reserve_price
                ? {
                    $gte: min_reserve_price,
                    $lte: max_reserve_price,
                  }
                : { $gte: 0 },
        },
        { condition: { $in: superior_conditions } },
        {
          end_date: active
            ? { $gt: Date.now() }
            : { $gt: new Date("1970-01-01T00:00:00Z") },
        },
        {
          _id: q
            ? { $in: searchedAuctions.map((auction) => auction._id) }
            : { $in: allAuctions.map((auction) => auction._id) },
        },
      ],
    })
      .populate({
        path: "book",
        populate: {
          path: "courses",
          select: "-_id -__v -auctions -books -year._id",
          populate: {
            path: "university",
            select: "-_id -__v -courses ",
            populate: {
              path: "city",
              select: "-_id -__v -universities -courses",
            },
          },
        },
        select: "-_id -__v -auctions",
      })
      .populate({
        path: "seller",
        select: "-__v -_id -password -email -role",
      })
      .select("-_id -__v -images");

    if (!auctions) {
      return BadRequestException(req, res, "No auctions found");
    } else {
      return auctions;
    }
  } catch (err) {
    return InternalException(req, res, "Error while searching auctions");
  }
};

export const getAuctionController = async (req: Request, res: Response) => {
  if (Object.keys(req.query).length === 0) {
    const auctions = await Auction.find().select("-_id");
    return res.status(200).json(auctions);
  }

  validateForm(req, res, req.query, queryValidator);

  try {
    let auctions = await searchAuctions(req, res);

    if (!auctions) {
      return BadRequestException(req, res, "No auctions found");
    }

    return res.status(200).json(auctions);
  } catch (e) {
    console.log(e);
    return InternalException(req, res, "Error while returning auctions");
  }
};

export const getAuctionDetailsController = async (
  req: Request,
  res: Response,
) => {
  const auction_id = req.params.id;

  if (!auction_id) {
    return BadRequestException(req, res, "Not a valid parameter");
  }

  try {
    const auction = await Auction.findById(auction_id)
      .populate({
        path: "book",
        populate: {
          path: "courses",
          select: "-_id -__v -auctions -books -year._id",
          populate: {
            path: "university",
            select: "-_id -__v -courses ",
            populate: {
              path: "city",
              select: "-_id -__v -universities -courses",
            },
          },
        },
        select: "-_id -__v -auctions",
      })
      .populate({
        path: "seller",
        select: "-__v -_id -password -email -role",
      })
      .select("-__v ");

    if (!auction) {
      return BadRequestException(req, res, "Auction not found");
    }

    return res.status(200).json(auction);
  } catch (err) {
    return InternalException(req, res, "Error while getting auction details");
  }
};

