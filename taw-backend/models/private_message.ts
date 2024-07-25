import mongoose, { Model } from 'mongoose';

const PrivateMessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "can't be blank"],
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
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

const PrivateMessage: Model<any> = mongoose.model('PrivateMessage', PrivateMessageSchema);

export default PrivateMessage;