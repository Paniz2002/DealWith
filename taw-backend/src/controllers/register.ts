import { Request, Response } from "express";
// import prisma from "../../prisma/prisma_db_connection";
import { z } from "zod";
import bcrypt from "bcryptjs";
// import { Role } from "@prisma/client";
import BadRequestException from "../exceptions/bad-request";
import UserModel from "../../models/user";
import connectDB from "../../config/db";

const formValidator = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  role: z.string(),
});
// TODO: find out why this crashes the validation process.
// .refine((form) => {
//   form.password === form.confirmPassword,
//     {
//       message: "Passwords do not match.",
//       path: ["error"],
//     };
// });

const validateForm = (input: unknown) => {
  try {
    const isValid = formValidator.parse(input);
    return isValid;
  } catch (e) {
    return false;
  }
};

export const registerController = async (req: Request, res: Response) => {

  connectDB();

  const isValid = validateForm(req.body);
  if (!isValid) {
    return BadRequestException(req, res, "Invalid username or password");
  }
  if (req.body.password !== req.body.confirmPassword) {
    return BadRequestException(req, res, "Passwords do not match.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const alreadyRegisteredUser = await UserModel.findOne({
    'username':req.body.username
  });
  if (alreadyRegisteredUser) {
    return BadRequestException(req, res, "User already exists.");
  }

  const user = new UserModel(
      {
        "username":req.body.username,
        "password": hashedPassword,
        /* TODO: aggiungere l'email al form frontend  */
        "email":"a@b.com",
        "role":req.body.role
      }
  )

  try{
    await user.save();
    res.send(user);
  }catch (err){
    res.status(500).send(err);
    return;
  }
  /*
  await prisma.user.create({
    data: {
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role,
    },
  });*/
};

