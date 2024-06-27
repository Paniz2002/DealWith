import mongoose, {Model} from 'mongoose';
import bcrypt from 'bcryptjs';
import uniqueValidator from 'mongoose-unique-validator';

const Email = new mongoose.Schema({

    address: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    // Change the default to true if you don't need to validate a new user's email address
    validated: {type: Boolean, default: true}

});


const UserSchema = new mongoose.Schema({

    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    //Our password is hashed with bcrypt
    password: { type: String, required: true },
    email: {type: Email, required: true},
    profile: {
        firstName: String,
        lastName: String,
        avatar: String,
        bio: String,
    },
    role: {
        type: String,
        enum: ["student", "moderator"],
        default: "student"
    },

},{
    timestamps:true
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function(plaintext: any, callback: (arg0: null, arg1: any) => any) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};

const UserModel:Model<any> = mongoose.model("User", UserSchema);

export default UserModel;