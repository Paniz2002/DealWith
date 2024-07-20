import mongoose, { Model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const BookSchema = new mongoose.Schema({
    images:{
        type: [String],
        required: false
    },
    title: {
        type: String,
        lowercase: false,
        required: [true, "can't be blank"],
    },
    year: {
        type: Number,
        index:true
    },
    ISBN: {
        type: String,
        required: [true, "can't be blank"],
        validate: {
            validator: (v:String) => !(v.length != 13 && v.length != 10)
        },
        unique: true,
        index:true
    },
    condition: {
        type: String,
        enum: ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor'],
        required: [true, "can't be blank"],
    },
    auction_duration: {
        type: Number
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
    }
});

BookSchema.plugin(uniqueValidator, { message: 'already exists' });

const Book: Model<any> = mongoose.model('Book', BookSchema);

export default Book;