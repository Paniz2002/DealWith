import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import uniqueValidator from "mongoose-unique-validator";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true,
    },
    //Our password is hashed with bcrypt
    password: { type: String, required: true },
    email: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
      required: true,
    },

    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: String,
    },
    role: {
      type: String,
      enum: ["student", "moderator"],
      default: "student",
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (plaintext: string) {
  return bcrypt.compareSync(plaintext, this.password);
};

UserSchema.methods.isModerator = function () {
  return this.role === "moderator";
};

const User: Model<any> = mongoose.model("User", UserSchema);

export default User;
