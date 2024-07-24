import mongoose, { Model } from 'mongoose';

const AuctionSchema = new mongoose.Schema({
    images:{
        type: [String],
        required: false
    },
    condition: {
        type: String,
        enum: ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor'],
        required: [true, "can't be blank"],
    },
    start_date:{
        type: Date,
        required: [true, "can't be blank"]
    },
    end_date:{
        type: Date,
        required: [true, "can't be blank"]
    },
    starting_price: {
        type: Number,
        required: [true, "can't be blank"],
    },
    reserve_price: {
        type: Number,
        required: [true, "can't be blank"]
    },
    description: {
        type: String
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "can't be blank"]
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }
},{
    timestamps: true
});

const Auction: Model<any> = mongoose.model('Auction', AuctionSchema);

export default Auction;