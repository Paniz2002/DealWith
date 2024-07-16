import mongoose, { Model } from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

const EmailSchema = new mongoose.Schema({
    address: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true,
    },
    validated: { type: Boolean, default: true },
}, {
    timestamps: true
});

EmailSchema.plugin( uniqueValidator, { message: 'is already taken' });

const Email: Model<any> = mongoose.model('Email', EmailSchema);

export default Email;
