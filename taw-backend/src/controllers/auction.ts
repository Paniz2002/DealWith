import { Request, Response } from "express";
import { z } from "zod";
import connectDB from "../config/db";
import BadRequestException from "../exceptions/bad-request";
import UnauthorizedException from "../exceptions/unauthorized";
import InternalException from "../exceptions/internal-exception";
import Auction from "../../models/auction";
import Book from "../../models/book";
import Comment from "../../models/comment";
import { validateForm } from "../utils/validate";
import fullTextSearch from "../utils/search";
import { getUserId } from "../utils/userID";
import Bid from "../../models/bid";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import Course from "../../models/course";
import NotFoundException from "../exceptions/not-found";
import NotFound from "../exceptions/not-found";
import User from "../../models/user";
import mongoose, { ClientSession } from "mongoose";

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
    course_id: z.string(),
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
  let test = validateForm(req, res, req.body, formValidator);
  if (test !== true) {
    return test;
  }
  await connectDB();

  const {
    condition,
    start_date,
    end_date,
    starting_price,
    reserve_price,
    description,
    book_id,
    course_id,
  } = req.body;
  try {
    const user_id = getUserId(req, res);
    const book = await Book.findById(book_id);
    if (!book) {
      return NotFoundException(req, res, "Book not found");
    }

    let alreadyExistingCourse = await Course.findById(course_id);
    if (!alreadyExistingCourse) {
      return NotFoundException(req, res, "Course not found");
    }

    //check if course exists in the book
    let courseExists = false;
    for (let course of book.courses) {
      if (course.toString() === course_id) {
        courseExists = true;
        break;
      }
    }
    if (!courseExists) {
      book.courses.push(alreadyExistingCourse);
      book.save();
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

    return res.status(200).json(auction);
  } catch (err) {
    console.log(err);
    return InternalException(req, res, "Unknown error while creating listing");
  }
};

export const uploadAuctionImagesController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.files) {
      return BadRequestException(req, res, "No images uploaded");
    }

    const { auction_id } = req.body;

    if (!auction_id) {
      return BadRequestException(req, res, "Missing auction_id or user_id");
    }

    const auction = await Auction.findById(auction_id);
    if (!auction) {
      return NotFoundException(req, res, "Auction or user not found");
    }

    const user_id = getUserId(req, res);

    if (!(await canOperate(auction.seller.toString(), user_id))) {
      return UnauthorizedException(req, res, "Unauthorized");
    }

    const files = req.files as Express.Multer.File[];

    /*
        Check if the auction already has images, if it does, delete them (necessary to edit auction images)
        */
    if (auction.images) {
      auction.images = [];
    }

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
      return NotFound(req, res, "Auction not found");
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
        return NotFound(req, res, "No auctions found");
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
          _id: q
            ? {
                $in: searchedAuctions.map(
                  (auction: { _id: any }) => auction._id,
                ),
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
      if (active && !auction.isActive()) {
        continue;
      }
      let currentPrice = auction.currentPrice();
      if (currentPrice >= min && currentPrice <= max) {
        priceFilteredAuctions.push(auction);
      }
    }

    if (!priceFilteredAuctions) {
      return NotFoundException(req, res, "No auctions found");
    } else {
      return priceFilteredAuctions;
    }
  } catch (err) {
    return InternalException(req, res, "Error while searching auctions");
  }
};

export const getAuctionController = async (req: Request, res: Response) => {
  await connectDB();
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
    if (!auctions || (auctions instanceof Array && auctions.length === 0)) {
      return NotFoundException(req, res, "No auctions found");
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
  await connectDB();
  const auction_id = req.params.id;

  if (!auction_id) {
    return BadRequestException(req, res, "Not a valid parameter");
  }

  try {
    if (!(await Auction.exists({ _id: auction_id }))) {
      return NotFound(req, res, "Auction not found");
    }
  } catch (e) {
    return NotFound(req, res, "Auction not found");
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
        select: "-__v -password -email -role",
      })
      .select("-__v -reserve_price");

    if (!auction) {
      return NotFound(req, res, "Auction not found");
    }
    let userId = undefined;
    if (req.cookies.jwt) {
      userId = getUserId(req, res);
    }
    const canClientOperate = userId
      ? await canOperate(auction.seller._id.toString(), userId)
      : false;
    const response = {
      isActive: auction.isActive(),
      canOperate: canClientOperate,
      ...auction.toObject(),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
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
  const { isPrivate } = req.query;
  const auctionID = req.params.id;
  await connectDB();

  const userID = getUserId(req, res);
  const filter = {
    private: false,
    $or: [{ sender: userID }, { receiver: userID }],
    auction: auctionID,
  };
  let publicComments_tmp = await Comment.find({
    private: null,
    auction: auctionID,
  })
    .select("-__v -createdAt -updatedAt")
    .populate({ path: "sender", select: "username _id" })
    .populate({ path: "inReplyTo" })
    .sort({ createdAt: 1 })
    .exec();
  let publicComments = [];
  for (let comment of publicComments_tmp) {
    const can_operate = await canOperate(comment.sender._id.toString(), userID);
    // Delete sender _id from comment
    delete comment.sender._id;
    publicComments.push({
      canOperate: can_operate,
      ...comment.toObject(),
    });
  }

  let privateComments: any[] = [];

  if (isPrivate) {
    filter.private = true;
    const privateComments_tmp = await Comment.find({
      private: true,
      auction: auctionID,
    })
      .select("-__v -createdAt -updatedAt")
      .populate({ path: "sender", select: "username _id" })
      .populate({ path: "receiver", select: "username" })
      .populate({ path: "inReplyTo" })
      .sort({ createdAt: 1 })
      .exec();

    for (let comment of privateComments_tmp) {
      const can_operate = await canOperate(
        comment.sender._id.toString(),
        userID.toString(),
      );
      //delete sender _id form comment
      delete comment.sender._id;
      privateComments.push({
        canOperate: can_operate,
        ...comment.toObject(),
      });
    }
  }
  return res.status(200).json({
    private_comments: privateComments,
    public_comments: publicComments,
  });
};

export const postAuctionCommentsController = async (
  req: Request,
  res: Response,
) => {
  const { isPrivate, replyTo, text, receiver } = req.body;
  const auctionID = req.params.id;
  const currentAuction = await Auction.findById(auctionID).exec();
  if (!currentAuction) {
    return BadRequestException(req, res, "Bad request: invalid auction.");
  }
  if (text === "") {
    return BadRequestException(req, res, "Bad request: invalid paramters.");
  }

  if (!receiver && isPrivate) {
    return BadRequestException(
      req,
      res,
      "Bad request: receiver is required for private messages.",
    );
  }

  const userID = getUserId(req, res);
  const params: any = {
    sender: userID,
    auction: auctionID,
    text: text,
  };
  await connectDB();
  let repliedComment;
  if (replyTo) {
    repliedComment = await Comment.findById(replyTo).exec();
    if (!repliedComment) {
      return BadRequestException(req, res, "Bad request: invalid parameters");
    }
    params.inReplyTo = repliedComment;
    params.private = repliedComment.private;
  }
  if (Boolean(isPrivate)) {
    params.private = true;
    params.receiver = receiver;
  }
  try {
    // await Comment.create(params);
    let comment = new Comment(params);
    await comment.save();

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return InternalException(req, res, "Unknown error while creating comment.");
  }
};

export const deleteAuctionController = async (req: Request, res: Response) => {
  const auction_id = req.params.id;
  await connectDB();
  const session: ClientSession = await mongoose.startSession();
  try {
    const userID = getUserId(req, res);
    const auction = await Auction.findById(auction_id);
    const user = await User.findById(userID);
    if (!auction) {
      return NotFoundException(req, res, "Auction not found");
    }
    if (!user) {
      return NotFoundException(req, res, "User not found");
    }
    if (!canOperate(auction.seller, userID))
      return BadRequestException(
        req,
        res,
        "Bad request: You cannot delete this auction.",
      );

    await Auction.deleteOne({ _id: auction_id });
    await Comment.deleteMany({ auction: auction_id });
    await session.commitTransaction();
    return res.sendStatus(200);
  } catch (e) {
    session.abortTransaction();
    return InternalException(req, res, "Error while deleting auction");
  } finally {
    session.endSession();
  }
};

export const getMyAuctionsController = async (req: Request, res: Response) => {
  try {
    const user_id = getUserId(req, res);
    await connectDB();
    const auctions = await Auction.find({ seller: user_id })
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
        select: "-__v -_id -password -notifications -email -role",
      })
      .select("-__v");

    //add isActive result to each auction
    let mappedAuctions = [];
    for (const auction of auctions) {
      let auctionObject = auction.toObject();
      auctionObject.isActive = auction.isActive();
      auctionObject.isSold = auction.isSold();
      auctionObject.currentPrice = auction.currentPrice();
      auctionObject.lastBidPrice = auction.lastBidPrice();
      auctionObject.lastBidder = await auction.lastBidder();
      mappedAuctions.push(auctionObject);
    }

    return res.status(200).json(mappedAuctions);
  } catch (e) {
    return InternalException(req, res, "Error while getting auctions");
  }
};

export const getMyParticipatedAuctionsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user_id = getUserId(req, res);
    await connectDB();
    const auctions = await Auction.find({
      bids: { $elemMatch: { user: user_id } },
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
        select:
          "-__v -_id -password -email -role -notifications -createdAt -updatedAt",
      })
      .select("-__v -reserve_price");

    let mappedAuctions = [];
    for (const auction of auctions) {
      const lastBidder = await auction.lastBidder();

      const isWinning = lastBidder._id.toString() === user_id.toString();
      const isActive = auction.isActive();

      const auctionObject = auction.toObject();
      delete auctionObject.bids;

      mappedAuctions.push({
        ...auctionObject,
        isWinning: isWinning,
        isActive: isActive,
      });
    }

    return res.status(200).json(mappedAuctions);
  } catch (e) {
    return InternalException(req, res, "Error while getting auctions");
  }
};

export const getAuctionStatisticsController = async (
  req: Request,
  res: Response,
) => {
  try {
    await connectDB();
    const auctions = await Auction.find()
      .populate({
        path: "book",
        populate: {
          path: "courses",
          select: "-_id -__v -auctions -books -year._id -notifications",
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
        select: "-__v -_id -password",
      })
      .select("-__v ");

    const mappedAuctions = auctions.map((auction) => {
      const isActive = auction.isActive();
      const isSold = auction.isSold();

      const auctionObject = auction.toObject();

      return {
        ...auctionObject,
        isActive: isActive,
        isSold: isSold,
      };
    });

    return res.status(200).json(mappedAuctions);
  } catch (e) {
    console.log(e);
    return InternalException(req, res, "Error while getting auctions");
  }
};

export const deleteCommentController = async (req: Request, res: Response) => {
  const user_id = getUserId(req, res);
  const user = await User.findById(user_id);
  if (!user) {
    return NotFoundException(req, res, "User not found");
  }
  const auction = await Auction.findById(req.params.id);
  if (!auction) {
    return NotFoundException(req, res, "Auction not found");
  }
  const comment_id = req.params.idcomment;
  const comment = await Comment.findById(comment_id);
  if (!comment) {
    return NotFoundException(req, res, "Comment not found");
  }
  if (!(await canOperate(comment.sender.toString(), user_id.toString()))) {
    return UnauthorizedException(
      req,
      res,
      "Unauthorized: You are not the sender of this comment",
    );
  }
  await comment.deleteOne();
  return res.status(200).send("Comment deleted");
};

export const editCommentController = async (req: Request, res: Response) => {
  try {
    const userID = getUserId(req, res);
    const user = await User.findById(userID);
    if (!user) {
      return NotFoundException(req, res, "User not found");
    }
    const auctionID = req.params.id;
    const currentAuction = await Auction.findById(auctionID).exec();
    if (!currentAuction) {
      return BadRequestException(req, res, "Bad request: invalid auction.");
    }
    const comment_id = req.params.idcomment;
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return NotFoundException(req, res, "Comment not found");
    }
    if (!(await canOperate(comment.sender.toString(), userID.toString()))) {
      return UnauthorizedException(
        req,
        res,
        "Unauthorized: You are not the sender of this comment",
      );
    }
    const { text, replyTo, isPrivate, receiver } = req.body;
    if (!text) {
      return BadRequestException(req, res, "Bad request: text is required");
    }
    comment.text = text;
    let repliedComment;
    if (replyTo) {
      repliedComment = await Comment.findById(replyTo).exec();
      if (!repliedComment) {
        return BadRequestException(req, res, "Bad request: invalid parameters");
      }
      comment.inReplyTo = repliedComment;
      comment.private = repliedComment.private;
    } else {
      comment.inReplyTo = undefined;
      comment.private = undefined;
    }
    if (Boolean(isPrivate)) {
      comment.private = true;
      // comment.receiver = receiver; //FIXME: probably we dont have to change if im a moderator, so leave it as it is, so leave the comment
    } else {
      comment.private = undefined;
      comment.receiver = undefined;
    }

    comment.save();
    return res.status(200).send("Comment edited");
  } catch (err) {
    console.error(err);
    return InternalException(req, res, "Unknown error while editing comment.");
  }
};

export const patchAuctionController = async (req: Request, res: Response) => {
  try {
    const user_id = getUserId(req, res);

    const auction_id = req.params.id;
    const { description, condition, book_title, book_author, ISBN } = req.body;

    await connectDB();
    const auction = await Auction.findById(auction_id);
    const book = await Book.findById(auction.book);

    if (!(await canOperate(auction.seller.toString(), user_id))) {
      return UnauthorizedException(
        req,
        res,
        "Unauthorized: You are not the seller of this auction",
      );
    }

    if (!auction) {
      return NotFoundException(req, res, "Auction not found");
    }

    if (!book) {
      return NotFoundException(req, res, "Book not found");
    }

    if (description) auction.description = description;

    if (condition) {
      if (!conditions.includes(condition))
        return BadRequestException(req, res, "Invalid condition");
      auction.condition = condition;
    }

    if (book_title) book.title = book_title;

    if (book_author) book.author = book_author;

    if (ISBN) book.ISBN = ISBN;

    await book.save();

    await auction.save();

    return res.status(200).send("Auction updated");
  } catch (e) {
    return InternalException(req, res, "Error while updating auction");
  }
};

async function canOperate(user_id_to_check: string, user_id: string) {
  console.log("canOperate", user_id_to_check, user_id);
  if (user_id_to_check === user_id) {
    return true;
  }
  const user = await User.findById(user_id);
  if (!user) {
    throw new Error("User not found");
  }
  return await user.isModerator();
}
