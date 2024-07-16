import mongoose, { Model } from 'mongoose';

const PrivateMessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "can't be blank"],
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, "can't be blank"]
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "can't be blank"]
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "can't be blank"]
    }
});