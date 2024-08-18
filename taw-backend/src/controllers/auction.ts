import { Request, Response } from "express";
import { z } from "zod";
import connectDB from "../config/db";
import BadRequestException from "../exceptions/bad-request";
import UnauthorizedException from "../exceptions/unauthorized";
import InternalException from "../exceptions/internal-exception";
import Auction from "../../models/auction";
import Book from "../../models/book";
import User from "../../models/user";
import Comment from "../../models/comment";
import { validateForm } from "../utils/validate";
import fullTextSearch from "../utils/search";
import { getUserId } from "../utils/userID";
import Bid from "../../models/bid";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const conditions = ["Mint", "Near Mint", "Excellent", "Good", "Fair", "Poor"];

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
    const book = await Book.findById(book_id);
    if (!book) {
      return BadRequestException(req, res, "Book not found");
    }
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

/*export const uploadAuctionImagesController = async (
    req: Request,
    res: Response,
) => {
    if (!req.files) {
        return BadRequestException(req, res, "No images uploaded");
    }

    console.log(req.files);

    const {auction_id, seller_id} = req.body;

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
};*/

export const uploadAuctionImagesController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.files) {
      return BadRequestException(req, res, "No images uploaded");
    }

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

    if (!auction.isOwner(user_id)) {
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

    for (const file of files) {
      // Genera un percorso temporaneo per l'output del file convertito ( workaround per un errore )
      const tempOutputPath = path.join(
        file.destination,
        `temp-${file.filename}`,
      );

      // Converti l'immagine in .webp
      await sharp(file.path).webp().toFile(tempOutputPath);

      fs.unlinkSync(file.path);

      const finalOutputPath = path.join(file.destination, file.filename);
      fs.renameSync(tempOutputPath, finalOutputPath);

      auction.images.push(finalOutputPath);
    }

    await auction.save();

    return res.status(200).send("Images uploaded and converted to .webp");
  } catch (e) {
    console.log(e);
    return InternalException(req, res, "Error while saving images");
  }
};

export const getAuctionImagesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const auction_id = req.params.id;

    const auction = await Auction.findById(auction_id);
    if (!auction) {
      return BadRequestException(req, res, "Auction not found");
    }

    const imagesBase64 = auction.images.map((imagePath: string) => {
      const image = fs.readFileSync(path.resolve(imagePath));
      return image.toString("base64");
    });

    res.json({ images: imagesBase64 });
  } catch (e) {
    return InternalException(req, res, "Error while getting images");
  }
};

const queryValidator = z.object({
  q: z.string().optional(),
  condition: z
    .enum(["Mint", "Near Mint", "Excellent", "Good", "Fair", "Poor"])
    .optional(),
});

const getSuperiorConditions = function (currentCondition: string) {
  const index = conditions.indexOf(currentCondition);
  if (index === -1) {
    throw new Error("Invalid condition");
  }
  return conditions.slice(0, index + 1);
};

const searchAuctions = async function (req: Request, res: Response) {
  try {
    const { q, min_price, max_price, min_condition, active } = req.query;

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
        return BadRequestException(req, res, "Invalid condition");
      }
    }

    // If q is provided, search for books and auctions that match the query
    let searchedAuctions = [];
    //  let books = [];
    const allAuctions = await Auction.find();
    if (q) {
      searchedAuctions = await fullTextSearch(Auction, q.toString());
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
        { condition: { $in: superior_conditions } },
        {
          end_date: active
            ? { $gt: Date.now() }
            : { $gt: new Date("1970-01-01T00:00:00Z") },
        },
        {
          _id: q
            ? {
                $in: searchedAuctions.map(
                  (auction: { _id: any }) => auction._id,
                ),
                // .concat(books),
              }
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
        select: "-__v -_id -password -email -role -notifications",
      })
      .select("-__v -reserve_price");

    let min = 0,
      max = Number.MAX_VALUE;
    if (min_price) min = parseInt(min_price.toString());
    if (max_price) max = parseInt(max_price.toString());

    let priceFilteredAuctions = [];

    for (let auction of auctions) {
      let currentPrice = auction.currentPrice();
      if (currentPrice >= min && currentPrice <= max) {
        priceFilteredAuctions.push(auction);
      }
    }

    if (!priceFilteredAuctions) {
      return BadRequestException(req, res, "No auctions found");
    } else {
      return priceFilteredAuctions;
    }
  } catch (err) {
    return InternalException(req, res, "Error while searching auctions");
  }
};

export const getAuctionController = async (req: Request, res: Response) => {
  if (Object.keys(req.query).length === 0) {
    const auctions = await Auction.find()
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
      .select("-__v -reserve_price");
    return res.status(200).json(auctions);
  }

  validateForm(req, res, req.query, queryValidator);

  try {
    let auctions = await searchAuctions(req, res);

    if (auctions instanceof Array) {
      if (auctions.length === 0)
        return BadRequestException(req, res, "No auctions found");
    }

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
      .select("-__v -reserve_price");

    if (!auction) {
      return BadRequestException(req, res, "Auction not found");
    }

    return res.status(200).json(auction);
  } catch (err) {
    return InternalException(req, res, "Error while getting auction details");
  }
};

const getLastBidPrice = (bids: any, startingPrice: Number): Number => {
  let currMax: Number = -1;
  bids.forEach((bid: any) => {
    currMax = bid.price > currMax ? bid.price : currMax;
  });
  return currMax >= startingPrice ? currMax : startingPrice;
};

export const postAuctionBidController = async (req: Request, res: Response) => {
  await connectDB();
  const { auctionID, price } = req.body;
  const userID = getUserId(req, res);
  const auction = await Auction.findById(auctionID).exec();
  if (!auction) {
    return BadRequestException(req, res, "Bad request: invalid auction.");
  }
  if (price <= getLastBidPrice(auction.bids, auction.starting_price)) {
    return BadRequestException(req, res, "Bad request: invalid price.");
  }
  const now = Date.now();
  if (now > auction.end_date) {
    return BadRequestException(req, res, "Bad request: auction ended.");
  }
  auction.bids.push(new Bid({ price: price, user: userID }));
  await auction.save();
  return res.sendStatus(200);
};

export const getAuctionCommentsController = async (
  req: Request,
  res: Response,
) => {
  const { isPrivate, auctionID } = req.query;
  await connectDB();

  const userID = getUserId(req, res);
  const filter = {
    private: false,
    $or: [{ sender: userID }, { receiver: userID }],
    auction: auctionID,
  };
  const publicComments = await Comment.find(filter)
    .populate("sender receiver")
    .sort({ createdAt: 1 })
    .exec();
  let privateComments;
  if (isPrivate) {
    filter.private = true;
    privateComments = await Comment.find(filter)
      .populate("sender reciever")
      .sort({ createdAt: 1 })
      .exec();
  }
  return res.status(200).json({
    private_comments: privateComments,
    public_comments: publicComments,
  });
};

export const patchAuctionController = async (req: Request, res: Response) => {
  try {
    const auction_id = req.params.id;
    const { description, condition, book_id } = req.body;

    await connectDB();
    const auction = await Auction.findById(auction_id);
    if (!auction) {
      return BadRequestException(req, res, "Auction not found");
    }

    if (description) auction.description = description;

    if (condition) {
      if (!conditions.includes(condition))
        return BadRequestException(req, res, "Invalid condition");
      auction.condition = condition;
    }

    if (book_id) {
      const book = await Book.findById(book_id);
      if (!book) return BadRequestException(req, res, "Book not found");
      auction.book = book_id;
    }

    await auction.save();

    return res.status(200).send("Auction updated");
  } catch (e) {
    return InternalException(req, res, "Error while updating auction");
  }
};

export const deleteAuctionController = async (req: Request, res: Response) => {
  try {
    const auction_id = req.params.id;

    await connectDB();

    const auction = await Auction.findById(auction_id);

    if (!auction) {
      return BadRequestException(req, res, "Auction not found");
    }

    await Auction.deleteOne({ _id: auction_id });
    return res.status(200).send("Auction deleted");
  } catch (e) {
    return InternalException(req, res, "Error while deleting auction");
  }
};
