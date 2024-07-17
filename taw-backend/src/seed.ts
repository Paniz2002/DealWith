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


const seedData = async () => {
    await connectDB();
    let venice = new City({
        name: 'Venice',
        province: 'Venice',
        country: 'Italy'
    });
    await venice.save();
}

seedData().then(r => {
    console.log('Seeds done!');
    process.exit(0);
}).catch(e => {
    console.error('Error in seeds:', e)
});