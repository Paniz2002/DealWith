import mongoose, { Model } from "mongoose";
import User from "./user";
import Auction from "./auction";

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "can't be blank"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, "can't be blank"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auction,
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

const PublicComment: Model<any> = mongoose.model("Comment", CommentSchema);
export default PublicComment;
