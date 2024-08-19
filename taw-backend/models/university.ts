import mongoose, { Model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import City from "./city";
import Course from "./course";

const UniversitySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
  },
  /*courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Course,
    },
  ], */
});

UniversitySchema.plugin(uniqueValidator, { message: "already exists" });
UniversitySchema.index({ "$**": "text" });
const University: Model<any> = mongoose.model("University", UniversitySchema);

export default University;
