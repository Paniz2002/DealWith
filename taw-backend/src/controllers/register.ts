import { Request, Response } from "express";
import { z } from "zod";
import BadRequestException from "../exceptions/bad-request";
import connectDB from "../config/db";
import User from "../../models/user";
import InternalException from "../exceptions/internal-exception";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import UserModel from "../../models/user";
import UnauthorizedException from "../exceptions/unauthorized";

// Form validation schema
const formValidator = z.object({
  name: z.string().min(2),
  surname: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(8),
  email: z.string().email("This is not a valid email."),
  confirmPassword: z.string().min(8),
  role: z.enum(["student", "moderator"]),
});

// Validate form input
const validateForm = (input: unknown) => {
  try {
    formValidator.parse(input); //throws exception if invalid
    return true;
  } catch (e) {
    return false;
  }
};

// Registration controller
export const registerController = async (req: Request, res: Response) => {
  await connectDB();
  const isValid = validateForm(req.body);
  if (!isValid) {
    return BadRequestException(
      req,
      res,
      "Invalid username, email, or password",
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return BadRequestException(req, res, "Passwords do not match.");
  }

  // Check if the user already exists
  const alreadyRegisteredUser = await User.findOne({
    username: req.body.username,
  });
  if (alreadyRegisteredUser) {
    return BadRequestException(req, res, "User already exists.");
  }

  // Check if the email already exists
  const alreadyRegisteredEmail = await User.findOne({
    address: req.body.email,
  });
  if (alreadyRegisteredEmail) {
    return BadRequestException(req, res, "Email already exists.");
  }

  const token = req.cookies.jwt;
  if (token) {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await UserModel.findOne({
      _id: payload._id,
    });
    if ((!user || !user.isModerator()) && req.body.role == "moderator") {
      return UnauthorizedException(
        req,
        res,
        "Unauthorized: User is not a moderator.",
      );
    }
  } else {
    req.body.role = "student";
  }
  try {
    // Create a new email document
    // Create a new user document
    const user = new User({
      profile: {
        firstName: req.body.name,
        lastName: req.body.surname,
      },
      username: req.body.username,
      password: req.body.password, //encrypted byt the user model
      email: req.body.email, // Reference the saved email document
      role: req.body.role,
    });

    // Save the user document
    await user.save();
    return res.sendStatus(200);
  } catch (err) {
    return InternalException(req, res, "Unknown error while registering user.");
  }
};
