import connectDB from "../config/db";
import Auction from "../../models/auction";
import Book from "../../models/book";
import User from "../../models/user";

const checkAuctionsEnd = async () => {
    await connectDB();
    const auctions = await Auction.find();
    auctions.forEach(async (auction) => {
        const book = await Book.findById(auction.book);
        if (!auction.isActive) {
            let seller = await User.findById(auction.seller);

            let lastBid = auction.bids[auction.bids.length - 1];
            if(lastBid) {
                let buyer = await User.findById(lastBid.user);

                if(lastBid.price >= auction.reserve_price) {
                    seller.notifications.push({
                        text: `Your auction for ${book.title} has ended`,
                        auction: auction._id,
                    });

                    await seller.save();

                    buyer.notifications.push({
                        text: `You won the auction for ${book.title}`,
                        auction: auction._id,
                    });
                    await buyer.save();
                }else{
                    seller.notifications.push({
                        text: `Your auction for ${book.title} did not reach the reserve price`,
                        auction: auction._id,
                    });
                    await seller.save();

                    buyer.notifications.push({
                        text: `You lost the auction for ${book.title}`,
                        auction: auction._id,
                    });

                    await buyer.save();

                }
            }else{
                seller.notifications.push({
                    text: `Your auction for ${book.title} did not receive any bids`,
                    auction: auction._id,
                });
                await seller.save();

            }

            auction.is_active = false;
            await auction.save();
        }
    });
}
