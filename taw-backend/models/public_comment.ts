import mongoose, { Model } from 'mongoose';
import User from "./user";
import Auction from "./auction";

const PublicCommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "can't be blank"],
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: [true, "can't be blank"]
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: [true, "can't be blank"]
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Auction,
        required: [true, "can't be blank"]
    }
});

const PublicComment: Model<any> = mongoose.model('PublicComment', PublicCommentSchema);
export default PublicComment;