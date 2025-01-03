import mongoose, { Model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import Course from "./course";
import Auction from "./auction";

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    lowercase: false,
    required: [true, "can't be blank"],
  },
  author: {
    type: String,
    lowercase: false,
    required: [true, "can't be blank"],
  },
  year: {
    type: Number,
    required: [true, "can't be blank"],
    index: true,
    validate: {
      validator: (v: number) => !(v < 1970 && v > new Date().getFullYear()),
    },
  },
  ISBN: {
    type: String,
    required: [true, "can't be blank"],
    validate: {
      validator: (v: String) => !(v.length != 13 && v.length != 10),
    },
    unique: true,
    index: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Course,
    },
  ],
});


BookSchema.plugin(uniqueValidator, { message: "already exists" });
BookSchema.index({ "$**": "text" });

const Book: Model<any> = mongoose.model("Book", BookSchema);

export default Book;

