import mongoose from "mongoose";
import connectDB from "../config/db";
import Auction from "../../models/auction";
import Book from "../../models/book";
import User from "../../models/user";

export const checkAuctionsEnd = async () => {
    try{
        await connectDB();

        const auctions = await Auction.find();
        for (const auction of auctions) {
            if (!auction.isActive() ) {
                let seller = await User.findById(auction.seller);

                let lastBid = auction.bids[auction.bids.length - 1];
                if (lastBid) {
                    let buyer = await User.findById(lastBid.user);

                    if (lastBid.price >= auction.reserve_price) {
                        if (!seller.existingNotification(auction._id, "AUCTION_END")) {
                            seller.notifications.push(await AuctionEndNotification(auction._id));
                            await seller.save();
                        }

                        for(const bid of auction.bids){
                            let bidder = await User.findById(bid.user);
                            if(bid.user !== lastBid.user && !bidder.existingNotification(auction._id, "AUCTION_LOSE")){
                                bidder.notifications.push(await AuctionLoseNotification(auction._id));
                                await bidder.save();
                            }
                        }

                        if (!buyer.existingNotification(auction._id, "AUCTION_WIN")) {
                            buyer.notifications.push(await AuctionWinNotification(auction._id));
                            await buyer.save();
                        }

                    } else {
                        if (!seller.existingNotification(auction._id, "AUCTION_RESERVE")) {
                            seller.notifications.push(await AuctionReserveNotification(auction._id));
                            await seller.save();
                        }

                        for (const bid of auction.bids) {
                            let bidder = await User.findById(bid.user);
                            if (!bidder.existingNotification(auction._id, "AUCTION_LOSE")) {
                                bidder.notifications.push(await AuctionLoseNotification(auction._id));
                                await bidder.save();
                            }
                        }
                    }
                } else {
                    if (!seller.existingNotification(auction._id, "AUCTION_NO_BIDS")) {
                        seller.notifications.push(await AuctionNoBidsNotification(auction._id));
                        await seller.save();
                    }
                }
                await auction.save();
            }
        }
    }catch(e){
        console.error(e);
    }
}


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