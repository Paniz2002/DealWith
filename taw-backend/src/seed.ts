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

import path from 'path';
import fs from 'fs';
import mongoose from "mongoose";

interface EmailData {
    address: string;
    validated: boolean;
}

interface UserProfile {
    firstName: string;
    lastName: string;
}

interface UserData {
    profile: UserProfile;
    username: string;
    password: string;
    email: string;
    role: string;
}

const seedEmails = async (emailsData: EmailData[]) => {
    for (const emailData of emailsData) {
        const { address, validated } = emailData;

        // Check if the email already exists
        let emailDoc = await Email.findOne({ address });
        if (!emailDoc) {
            emailDoc = await Email.create({ address, validated });
            console.log(`Email created for address: ${address}`);
        } else {
            console.log(`Email already exists for address: ${address}`);
        }
    }
};

const seedUsers = async (usersData: UserData[]): Promise<void> => {
    for (const userData of usersData) {
        const { profile, username, password, email, role } = userData;

        // Check if the email exists
        const emailDoc = await Email.findOne({ address: email });
        if (!emailDoc) {
            console.error(`Email not found for address: ${email}`);
            continue;
        }

        // Check if the user already exists
        let userDoc = await User.findOne({ username });
        if (!userDoc) {
            userDoc = new User({
                profile,
                username,
                password,
                email: emailDoc._id,
                role
            });
            await userDoc.save();
            console.log(`User created and saved: ${username}`);
        } else {
            console.log(`User already exists: ${username}`);
        }
    }
};

const seedData = async () => {
    await connectDB()
    console.log("Connected to DB");

    try{
        const emailsFilePath = path.join(__dirname, 'data', 'emails.json');
        const usersFilePath = path.join(__dirname, 'data', 'users.json');

        const emailsData: EmailData[] = JSON.parse(fs.readFileSync(emailsFilePath, 'utf-8'));
        const usersData: UserData[] = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

        await seedEmails(emailsData);
        await seedUsers(usersData);
    }
    catch(err){
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }

}

seedData();