import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import Auction from "../models/auction";
import Book from "../models/book";
import City from "../models/city";
import Course from "../models/course";
import University from "../models/university";
import User from "../models/user";
import connectDB from "./config/db";


const seedUsers = async (): Promise<void> => {
  const usersFilePath = path.join(__dirname, "data", "users.json");
  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

  for (const userData of usersData) {
    const { profile, username, password, email, role } = userData;



    // Check if the user already exists
    let userDoc = await User.findOne({ username });
    if (!userDoc) {
      userDoc = new User({
        profile,
        username,
        password,
        email: username + '@example.com',
        role,
      });
      await userDoc.save();
      console.log(`User created and saved: ${username}`);
    } else {
      console.log(`User already exists: ${username}`);
    }
  }
};

const seedCourses = async (): Promise<void> => {
  const coursesFilePath = path.join(__dirname, "data", "courses.json");
  const coursesData = JSON.parse(fs.readFileSync(coursesFilePath, "utf-8"));

  for (const courseData of coursesData) {
    try {
      // Check if the course already exists
      const existingCourse = await Course.findOne({ name: courseData.name });
      if (!existingCourse) {
        const university = await University.findOne({
          name: courseData.university,
        });

        // Create the new course and save it
        const newCourse = new Course({
          name: courseData.name,
          university: university._id,
          year: courseData.year,
        });
        await newCourse.save();
        console.log(`Course saved: ${newCourse.name}`);
      } else {
        console.log(`Course already exists: ${existingCourse.name}`);
      }

      const newExistingCourse = await Course.findOne({ name: courseData.name });
      // Add the Course to the University
     /* const university = await University.findOne({
        name: courseData.university,
      });
      if (!university) {
        console.log(`University not found for course: ${courseData.name}`);
      } else {
        // Check if the course is already in the university
        if (!university.courses.includes(newExistingCourse._id)) {
          university.courses.push(newExistingCourse);
          await university.save();
          console.log(`Course added to university: ${newExistingCourse.name}`);
        } else {
          console.log(`Course already in university: ${existingCourse.name}`);
        }
      } */
    } catch (err) {
      console.error(`Error saving course: ${courseData.name}`, err);
    }
  }
};

const seedUniversities = async (): Promise<void> => {
  const universitiesFilePath = path.join(
    __dirname,
    "data",
    "universities.json",
  );
  const universitiesData = JSON.parse(
    fs.readFileSync(universitiesFilePath, "utf-8"),
  );

  for (const universityData of universitiesData) {
    try {
      // Check if the university already exists
      const existingUniversity = await University.findOne({
        name: universityData.name,
      });
      if (!existingUniversity) {
        const city = await City.findOne({ name: universityData.city });
        // Create the new university and save it
        const newUniversity = new University({
          name: universityData.name,
          city: city._id,
        });
        await newUniversity.save();

        console.log(`University saved: ${newUniversity.name}`);
      } else {
        console.log(`University already exists: ${existingUniversity.name}`);
      }

      const newExistingUniversity = await University.findOne({
        name: universityData.name,
      });
      // Add the University to the City
      /*const city = await City.findOne({ name: universityData.city });
      if (!city) {
        console.log(`City not found for university: ${universityData.name}`);
      } else {
        // Check if the university is already in the city
        if (!city.universities.includes(newExistingUniversity._id)) {
          city.universities.push(newExistingUniversity);
          await city.save();
          console.log(
            `University added to city: ${newExistingUniversity.name}`,
          );
        } else {
          console.log(
            `University already in city: ${newExistingUniversity.name}`,
          );
        }
      } */
    } catch (err) {
      console.error(`Error saving university: ${universityData.name}`, err);
    }
  }
};

const seedCities = async (): Promise<void> => {
  const citiesFilePath = path.join(__dirname, "data", "cities.json");
  const citiesData = JSON.parse(fs.readFileSync(citiesFilePath, "utf-8"));

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
};

const seedBooks = async (): Promise<void> => {
  const booksFilePath = path.join(__dirname, "data", "books.json");
  const booksData = JSON.parse(fs.readFileSync(booksFilePath, "utf-8"));

  for (const bookData of booksData) {
    try {
      // Check if the book already exists
      const existingBook = await Book.findOne({ ISBN: bookData.ISBN });
      const randomCourse = await Course.aggregate([{ $sample: { size: 1 } }]);
      const course = await Course.findById(randomCourse[0]._id);

      let newBook = existingBook;
      if (!existingBook) {
        // Create the new book and save it
        newBook = new Book({
          title: bookData.title,
          year: bookData.year,
          ISBN: bookData.ISBN,
          author: bookData.author,
        });
        await newBook.save();
        console.log(`Book saved: ${newBook.title}`);
       // course.books.push(newBook);
        course.save();
        console.log("Course added to book", course.name);
        newBook.courses.push(course);
        newBook.save();
        console.log("Book added to course", newBook.title);
      } else {
        console.log(`Book already exists: ${existingBook.ISBN}`);
      }
    } catch (err) {
      console.error(`Error saving book: ${bookData.title}`, err);
    }
  }
};

const seedAuctions = async (): Promise<void> => {
  const imagesPath = path.join(__dirname, "data", "images", "sample");
  const images = ["sample1.webp", "sample2.webp", "sample3.webp"].map((image) =>
    path.join(imagesPath, image),
  );

  const booksFilePath = path.join(__dirname, "data", "books.json");
  const booksData = JSON.parse(fs.readFileSync(booksFilePath, "utf-8"));

  for (const bookData of booksData) {
    bookData.images = images;

    try {
      const book = await Book.findOne({ ISBN: bookData.ISBN });
      //create auction if not present with current book id
      const auction = await Auction.findOne({ book: book._id });

      if (!auction) {
        const randomSeller = await User.aggregate([{ $sample: { size: 1 } }]);
        const newAuction = new Auction({
          images: bookData.images,
          condition: bookData.condition,
          start_date: bookData.start_date,
          end_date: bookData.end_date,
          starting_price: bookData.starting_price,
          reserve_price: bookData.reserve_price,
          description: bookData.description,
          seller: randomSeller[0]._id,
          book: book._id,
        });
        await newAuction.save();
        console.log(`Auction saved: ${newAuction.book}`);

        //add auction to book
       // book.auctions.push(newAuction);
        await book.save();
      }
    } catch (err) {
      console.error(`Error saving book: ${bookData.title}`, err);
    }
  }
};

const seedData = async () => {
  await connectDB();
  console.log("Connected to DB");

  try {
    await seedUsers();
  } catch (err) {
    console.error("Error seeding Users", err);
  }

  try {
    await seedCities();
  } catch (err) {
    console.error("Error seeding Cities", err);
  }

  try {
    await seedUniversities();
  } catch (err) {
    console.error("Error seeding Universities", err);
  }

  try {
    await seedCourses();
  } catch (err) {
    console.error("Error seeding Courses", err);
  }

  try {
    await seedBooks();
  } catch (err) {
    console.error("Error seeding Books", err);
  }

  try {
    await seedAuctions();
  } catch (err) {
    console.error("Error seeding Books", err);
  }

  await mongoose.connection.close();
};

seedData()
  .then(() => {
    console.log("Seeding complete");
  })
  .catch((err) => {
    console.error("Error seeding data", err);
  });
