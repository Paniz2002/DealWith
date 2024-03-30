import { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/prisma_db_connection";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import BadRequestException from "../exceptions/bad-request";

const formValidator = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  role: z.nativeEnum(Role),
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

/*
Non abbiamo bisogno di gestire le eccezioni in questo controller, perché il errorHandler si occuperà di fare try-catch.
*/

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isValid = validateForm(req.body);
  if (!isValid) {
    // express usa il middleware per gestire gli errori
    return BadRequestException(req, res, "Invalid username or password");
  }
  if (req.body.password !== req.body.confirmPassword) {
    return BadRequestException(req, res, "Passwords do not match.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const alreadyRegisteredUser = await prisma.user.findFirst({
    where: {
      username: req.body.username,
    },
  });
  if (alreadyRegisteredUser) {
    return BadRequestException(req, res, "User already exists.");
  }

  await prisma.user.create({
    data: {
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role,
    },
  });
  return res.sendStatus(200);
};

