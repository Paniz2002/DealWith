import mongoose, { Model } from "mongoose";

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"],
    index: true,
  },
  year: {
    type: { year1: Number, year2: Number },
    required: [true, "can't be blank"],
    index: true,
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
  },
  auctions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },
  ],
});
const Course: Model<any> = mongoose.model("Course", CourseSchema);
export default Course;

