import mongoose from "mongoose";
import connectDB from "../config/db";
import Auction from "../../models/auction";
import Book from "../../models/book";

export const AuctionEndNotification = async (auction_id: mongoose.Types.ObjectId) => {
    await connectDB();
    const auction = await Auction.findById(auction_id);
    const book = await Book.findById(auction.book);
    return {
        text: `Your auction for ${book.title} has ended`,
        auction: auction_id,
        code: "AUCTION_END"
    };
};

export const AuctionWinNotification = async (auction_id: mongoose.Types.ObjectId) => {
    await connectDB();
    const auction = await Auction.findById(auction_id);
    const book = await Book.findById(auction.book);
    return {
        text: `You won the auction for ${book.title}`,
        auction: auction_id,
        code: "AUCTION_WIN"
    };
}

export const AuctionLoseNotification = async (auction_id: mongoose.Types.ObjectId) => {
    await connectDB();
    const auction = await Auction.findById(auction_id);
    const book = await Book.findById(auction.book);
    return {
        text: `You lost the auction for ${book.title}`,
        auction: auction_id,
        code: "AUCTION_LOSE"
    };
}

export const AuctionNoBidsNotification = async (auction_id: mongoose.Types.ObjectId) => {
    await connectDB();
    const auction = await Auction.findById(auction_id);
    const book = await Book.findById(auction.book);
    return {
        text: `Your auction for ${book.title} did not receive any bids`,
        auction: auction_id,
        code: "AUCTION_NO_BIDS"
    };
}

export const AuctionReserveNotification = async (auction_id: mongoose.Types.ObjectId) => {
    await connectDB();
    const auction = await Auction.findById(auction_id);
    const book = await Book.findById(auction.book);
    return {
        text: `Your auction for ${book.title} did not reach the reserve price`,
        auction: auction_id,
        code: "AUCTION_RESERVE"
    };
}