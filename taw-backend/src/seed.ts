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

const seedEmails = async () => {
    const emailsFilePath = path.join(__dirname, 'data', 'emails.json');
    const emailsData = JSON.parse(fs.readFileSync(emailsFilePath, 'utf-8'));

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

const seedUsers = async (): Promise<void> => {
    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

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

const seedCourses = async (): Promise<void> => {
    const coursesFilePath = path.join(__dirname, 'data', 'courses.json');
    const coursesData = JSON.parse(fs.readFileSync(coursesFilePath, 'utf-8'));

    for (const courseData of coursesData) {
        try {
            // Check if the course already exists
            const existingCourse = await Course.findOne({ name: courseData.name });
            if (!existingCourse) {
                const university = await University.findOne({ name: courseData.university });

                // Create the new course and save it
                const newCourse = new Course({
                    name: courseData.name,
                    year: courseData.year,
                    university: university._id
                });
                await newCourse.save();
                console.log(`Course saved: ${newCourse.name}`);
            } else {
                console.log(`Course already exists: ${existingCourse.name}`);
            }

            // Add the Course to the University
            const university = await University.findOne({name: courseData.university});
            if (!university) {
                console.log(`University not found for course: ${courseData.name}`);
            }else{
                university.courses.push(existingCourse);
                await university.save();
                console.log(`Course added to university: ${existingCourse.name}`);
            }
        } catch (err) {
            console.error(`Error saving course: ${courseData.name}`, err);
        }
    }

}

const seedUniversities = async (): Promise<void> => {
    const universitiesFilePath = path.join(__dirname, 'data', 'universities.json');
    const universitiesData = JSON.parse(fs.readFileSync(universitiesFilePath, 'utf-8'));

    for (const universityData of universitiesData) {
        try {
            // Check if the university already exists
            const existingUniversity = await University.findOne({ name: universityData.name });
            if (!existingUniversity) {
                const city = await City.findOne({ name: universityData.city });
                // Create the new university and save it
                const newUniversity = new University({
                    name: universityData.name,
                    city: city._id
                });
                await newUniversity.save();

                console.log(`University saved: ${newUniversity.name}`);
            } else {
                console.log(`University already exists: ${existingUniversity.name}`);
            }
            // Add the University to the City
            const city = await City.findOne({name: universityData.city});
            if (!city) {
                console.log(`City not found for university: ${universityData.name}`);
            }else{
                city.universities.push(existingUniversity);
                await city.save();
                console.log(`University added to city: ${existingUniversity.name}`);
            }
        } catch (err) {
            console.error(`Error saving university: ${universityData.name}`, err);
        }
    }
}

const seedCities = async (): Promise<void> => {
    const citiesFilePath = path.join(__dirname, 'data', 'cities.json');
    const citiesData = JSON.parse(fs.readFileSync(citiesFilePath, 'utf-8'));

    for (const cityData of citiesData) {
        try {
            // Check if the city already exists
            const existingCity = await City.findOne({ name: cityData.name });
            if (!existingCity) {
                // Create the new city and save it
                const newCity = new City(cityData);
                await newCity.save();
                console.log(`City saved: ${newCity.name}`);
            } else {
                console.log(`City already exists: ${existingCity.name}`);
            }
        } catch (err) {
            console.error(`Error saving city: ${cityData.name}`, err);
        }
    }
}

const seedBooks = async (): Promise<void> => {
    const booksFilePath = path.join(__dirname, 'data', 'books.json');
    const booksData = JSON.parse(fs.readFileSync(booksFilePath, 'utf-8'));

    const imagesPath = path.join(__dirname, 'data', 'images','sample');
    const images = ['sample1.JPG', 'sample2.JPG', 'sample3.JPG'].map(image => path.join(imagesPath, image));

    for (const bookData of booksData) {
        bookData.images = images;

        try {
            // Check if the book already exists
            const existingBook = await Book.findOne({ ISBN: bookData.ISBN });
            if (!existingBook) {
                // Create the new book and save it
                const newBook = new Book(bookData);
                await newBook.save();
                console.log(`Book saved: ${newBook.title}`);
            } else {
                console.log(`Book already exists: ${existingBook.title}`);
            }
        } catch (err) {
            console.error(`Error saving book: ${bookData.title}`, err);
        }
    }
};


const seedData = async () => {
    await connectDB()
    console.log("Connected to DB");

    try{
        await seedEmails();
        await seedUsers();
        await seedCities();
        await seedUniversities();
        await seedCourses();
    }
    catch(err){
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }

}

seedData();