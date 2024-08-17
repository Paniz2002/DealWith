import mongoose, { Model } from "mongoose";
import University from "./university";
import Auction from "./auction";
import Book from "./book";

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"],
  },
  year: {
    type: { year1: Number, year2: Number },
    required: [true, "can't be blank"],
    index: true,
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: University,
  },
  auctions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auction,
    },
  ],
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Book,
    },
  ],
});

CourseSchema.index({ "$**": "text" });
const Course: Model<any> = mongoose.model("Course", CourseSchema);

export default Course;
