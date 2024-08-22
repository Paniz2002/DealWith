import mongoose, { Model } from "mongoose";
import User from "./user";
import Auction from "./auction";
import {io} from "../src";

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "can't be blank"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "can't be blank"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: [true, "can't be blank"],
    },
    private: {
      type: Boolean,
    },
    // This makes possible to have self referencing models.
    inReplyTo: this,
  },
  {
    timestamps: true,
  },
);

CommentSchema.post("save", async function (doc) {
    if(doc.private)
        io.to('auction_' + doc.auction.toString()).emit('private-comment', doc);
    else
        io.to('auction_' + doc.auction.toString()).emit('public-comment', doc);

    console.log('Comment emitted, is Private: ', doc.private);
});

const Comment: Model<any> = mongoose.model("Comment", CommentSchema);
export default Comment;
