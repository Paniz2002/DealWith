import mongoose, { Model } from "mongoose";
import User from "./user";

export const BidSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: [true, "can't be blank"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "can't be blank"],
    },
  },
  { timestamps: true },
);

const Bid: Model<any> = mongoose.model("Bid", BidSchema);

export default Bid;
