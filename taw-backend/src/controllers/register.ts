import { Request, Response } from "express";
import { z } from "zod";
import BadRequestException from "../exceptions/bad-request";
import connectDB from "../../config/db";
import Email from "../../models/email";
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
    return formValidator.parse(input);
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
  const alreadyRegisteredEmail = await Email.findOne({
    address: req.body.email,
  });
  if (alreadyRegisteredEmail) {
    return BadRequestException(req, res, "Email already exists.");
  }

  // TODO:
  // Create moderator only if currentUser jwt role is moderator.
  const token = req.cookies.jwt;
  const payload = jwt.verify(token, JWT_SECRET) as any;
  const user = await UserModel.findOne({
    _id: payload._id,
  });
  if (!token || !user) {
    //force user to be a student
    req.body.role = "student";
  }
  if (user && !user.isModerator()) {
    return UnauthorizedException(
      req,
      res,
      "Unauthorized: User is not a moderator.",
    );
  }

  try {
    // Create a new email document
    const email = await Email.create({
      address: req.body.email,
      validated: false,
    });

    // Create a new user document
    const user = new User({
      profile: {
        firstName: req.body.name,
        lastName: req.body.surname,
      },
      username: req.body.username,
      password: req.body.password, //encrypted byt the user model
      email: email._id, // Reference the saved email document
      role: req.body.role,
    });

    // Save the user document
    await user.save();
    res.sendStatus(200);
  } catch (err) {
    return InternalException(req, res, "Unknown error while registering user.");
  }
};
