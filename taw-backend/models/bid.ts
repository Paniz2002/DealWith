import mongoose, { Model } from 'mongoose';

const BidSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: [true, "can't be blank"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "can't be blank"]
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: [true, "can't be blank"]
    }
});

const Bid: Model<any> = mongoose.model('Bid', BidSchema);

export default Bid;
