import connectDB from "../config/db";
import User from '../models/user';
import Email from "../models/email";
import City from "../models/city";
import Book from '../models/book';
import Course from "../models/course";
import University from "../models/university";
import PublicComment from '../models/public_comment';
import PrivateMessage from '../models/private_message';
import Bid from '../models/bid';
import InternalException from "./exceptions/internal-exception";


const seedData = async () => {
    await connectDB()
    console.log("Connected to DB");

    try{
        const email = await Email.create({
            address:"nico.paaan@gmail.com",
            validated: false,
        });
        console.log("Email created");

        const user = new User({
            profile: {
                firstName: "Nicola",
                lastName: "Panizzolo",
            },
            username: "nicola",
            password: "dnjnsjsns",
            email_id: email._id,
            role: "moderator",
        });
        console.log("User created");

        await user.save();
        console.log("User saved");
    }
    catch(err){
        console.error(err);
    }

}

seedData();