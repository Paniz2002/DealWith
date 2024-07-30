import mongoose, {Model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        lowercase: false,
        required: [true, "can't be blank"],
    },
    year: {
        type: Number,
        index: true
    },
    ISBN: {
        type: String,
        required: [true, "can't be blank"],
        validate: {
            validator: (v: String) => !(v.length != 13 && v.length != 10)
        },
        unique: true,
        index: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    auctions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction'
    }]
});

BookSchema.plugin(uniqueValidator, {message: 'already exists'});
BookSchema.index({'$**': 'text'});

const Book: Model<any> = mongoose.model('Book', BookSchema);

export default Book;