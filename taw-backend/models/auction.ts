import mongoose, {Model} from "mongoose";
import {BidSchema} from "./bid";
import auction from "../src/routes/auction";
import {boolean} from "zod";
import User from "./user";

const AuctionSchema = new mongoose.Schema(
    {
        images: {
            type: [String],
            required: false,
        },
        condition: {
            type: String,
            enum: ["Mint", "Near Mint", "Excellent", "Good", "Fair", "Poor"],
            required: [true, "can't be blank"],
        },
        start_date: {
            type: Date,
            required: [true, "can't be blank"],
        },
        end_date: {
            type: Date,
            required: [true, "can't be blank"],
        },
        starting_price: {
            type: Number,
            required: [true, "can't be blank"],
        },
        reserve_price: {
            type: Number,
            required: [true, "can't be blank"],
        },
        description: {
            type: String,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "can't be blank"],
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
        },
        bids: {
            type: [BidSchema],
        }
    },
    {
        timestamps: true,
    },
);

AuctionSchema.index({"$**": "text"});

AuctionSchema.methods.isActive = function () {
    return this.end_date > Date.now();
};

AuctionSchema.methods.isOwner = function (user_id: string) {
    return this.seller.toString() === user_id;
};

AuctionSchema.methods.currentPrice = function () {
    if (this.bids.length === 0) {
        return this.starting_price;
    }
    return this.lastBidPrice();
}

AuctionSchema.methods.isSold = function () {
    return (<boolean>(this.bids.length > 0 && this.currentPrice() >= this.reserve_price));
}

AuctionSchema.methods.lastBidPrice = function () {
    if (this.bids.length === 0) {
        return 0;
    }
    return this.bids[this.bids.length - 1].price;
}
AuctionSchema.methods.lastBidder =  function () {
    if (this.bids.length === 0) {
        return {}  // Return a resolved promise with an empty object if there are no bids
    }

    let user_id = this.bids[this.bids.length - 1].user;
    if (!user_id) {
        console.error("User not found");
        return {};  // Return an empty object in case of an error
    }

    user_id = user_id.toString();

   return User.findById(user_id)
       .select("-__v -password -notifications -role")
       .populate({
           path: "email",
           select: "-__v -_id"
       });
};


const Auction: Model<any> = mongoose.model("Auction", AuctionSchema);

export default Auction;

