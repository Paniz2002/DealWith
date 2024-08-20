import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import uniqueValidator from "mongoose-unique-validator";
import {sendNotification} from "../src/utils/notifications";

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
    notifications:[{
        text: String,
        auction: mongoose.Schema.ObjectId,
        isRead: {type: Boolean, default: false},
        isVisible: {type: Boolean, default: true},
        code: {type: String, enum: ["AUCTION_END", "AUCTION_WIN", "AUCTION_LOSE", "AUCTION_NO_BIDS","AUCTION_RESERVE"]}
    }]
  },
  {
    timestamps: true,
  },
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });


let originalNotifications: { isRead: boolean; }[]= [];
UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  originalNotifications = [...filterUnreadNotifications(this.notifications)];
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});


UserSchema.post("save", async function (doc) {
    const newNotifications =  [...filterUnreadNotifications(doc.notifications)];
    if (JSON.stringify(originalNotifications) !== JSON.stringify(newNotifications)) {
        sendNotification(doc._id.toString());
    }


});

UserSchema.methods.comparePassword = function (plaintext: string) {
  return bcrypt.compareSync(plaintext, this.password);
};

UserSchema.methods.isModerator = function () {
  return this.role === "moderator";
};

UserSchema.methods.existingNotification = function (auction_id: mongoose.Types.ObjectId, code: string){
    return this.notifications.find((notification: { auction: { toString: () => string; }; code: string; }) => notification.auction.toString() === auction_id.toString() && notification.code === code);
}

UserSchema.methods.getToReadNotifications = function(){
    return filterUnreadNotifications(this.notifications);
}

function filterUnreadNotifications(notifications: { isRead: boolean; }[]){
    return notifications.filter((notification: { isRead: boolean; }) => !notification.isRead);
}


const User: Model<any> = mongoose.model("User", UserSchema);

export default User;
