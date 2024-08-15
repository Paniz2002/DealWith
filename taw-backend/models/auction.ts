import mongoose, { Model } from 'mongoose';
import Bid from "./bid";

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
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }
},{
    timestamps: true
});

AuctionSchema.index({'$**': 'text'});

AuctionSchema.methods.isActive = function(){
    return this.end_date > Date.now();
}

AuctionSchema.methods.isOwner = function(user_id: string){
    return this.seller.toString() === user_id;
}

AuctionSchema.methods.currentPrice = async function () {
    let bid = await Bid.findOne({auction: this._id}).sort({createdAt: -1});
    if(bid)
        return bid.price;
    else
        return this.starting_price;
}

const Auction: Model<any> = mongoose.model('Auction', AuctionSchema);

export default Auction;