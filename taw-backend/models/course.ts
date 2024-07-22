import mongoose, { Model } from 'mongoose';

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "can't be blank"],
    },
    year: {
        type: { year1: Number, year2: Number},
        required: [true, "can't be blank"],
        index: true
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University'
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }]
});

const Course: Model<any> = mongoose.model('Course', CourseSchema);

export default Course;