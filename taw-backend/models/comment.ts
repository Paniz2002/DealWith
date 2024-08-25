import mongoose, {Model} from "mongoose";
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
    emitToSocket(doc);
});

//emit after  delete
let toDelete: mongoose.CallbackWithoutResultAndOptionalError | null = null;
CommentSchema.pre(["deleteOne", "updateOne"], {document: true, query: false}, async function (doc) {
    toDelete = this.toObject();
});
CommentSchema.post(["deleteOne", "updateOne"], async function (doc) {
    emitToSocket(toDelete);
    toDelete = null;
});

function emitToSocket(doc: any) {
    if (doc.private)
        io.to('auction_' + doc.auction.toString()).emit('private-comment', doc);
    else
        io.to('auction_' + doc.auction.toString()).emit('public-comment', doc);
}

const Comment: Model<any> = mongoose.model("Comment", CommentSchema);
export default Comment;
