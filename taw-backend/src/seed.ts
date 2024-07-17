import connectDB from "../config/db";
import User from '../models/user';
/*
import Email from "../models/email";
import City from "../models/city";
import Book from '../models/book';
import Course from "../models/course";
import University from "../models/university";
import PublicComment from '../models/public_comment';
import PrivateMessage from '../models/private_message';
import Bid from '../models/bid';
*/

const seedData = async () => {
    connectDB();
}

seedData();