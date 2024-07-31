import mongoose, {Model} from 'mongoose';
import Book from "./book";
import Course from "./course";


const AuctionSchema = new mongoose.Schema({
    images: {
        type: [String],
        required: false,
        validate: {
            validator: (v: [String]) => !(v.length > 10) //validate array max 10 images
        }
    },
    condition: {
        type: String,
        enum: ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor'],
        required: [true, "can't be blank"],
    },
    start_date: {
        type: Date,
        required: [true, "can't be blank"]
    },
    end_date: {
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
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }
}, {
    timestamps: true
});


AuctionSchema.pre('deleteOne', async function (next) { //TODO: test this
    //get current id
    const id = this.getQuery()["_id"];
    await Book.updateMany(
        {auctions: id},
        {$pull: {auctions: id}}
    );
    await Course.updateMany(
        {auctions: id},
        {$pull: {auctions: id}}
    );

    next();
});
AuctionSchema.pre('deleteMany', async function (next) { //TODO: test this
    //get current id
    const id = this.getQuery()["_id"];
    await Book.updateMany(
        {auctions: id},
        {$pull: {auctions: id}}
    );
    await Course.updateMany(
        {auctions: id},
        {$pull: {auctions: id}}
    );
    next();
});

const Auction: Model<any> = mongoose.model('Auction', AuctionSchema);

export default Auction;