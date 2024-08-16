import connectDB from "../config/db";
import Auction from "../../models/auction";
import User from "../../models/user";
import {
    AuctionEndNotification,
    AuctionLoseNotification, AuctionNoBidsNotification,
    AuctionReserveNotification,
    AuctionWinNotification
} from "../utils/notifications";
import {Request, Response} from "express";
import {getUserId} from "../utils/userID";

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

export const getNotificationsController = async (req: Request, res: Response) => {
    try{
        const user_id = getUserId(req,res);
        await connectDB();
        const user = await User.findById(user_id);
        res.status(200).json(user.notifications);
    }catch(e){
        console.error(e);
        res.status(500).json({message: "Internal server error"});
    }
};