import { Request, Response } from "express";
import prisma from "../../prisma/prisma_db_connection";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
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
export const registerController = async (req: Request, res: Response) => {
  const isValid =
    validateForm(req.body) && req.body.password === req.body.confirmPassword;
  if (!isValid) {
    return res.status(400).send("ERROR: Invalid username or password.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const alreadyRegisteredUser = await prisma.user.findFirst({
    where: {},
  });
  if (alreadyRegisteredUser !== null) {
    return res.status(400).send("ERROR: User already registered.");
  }
  try {
    await prisma.user.create({
      data: {
        username: req.body.username,
        password: hashedPassword,
        role: req.body.role,
      },
    });
    return res.sendStatus(200);
  } catch (e) {
    return res
      .status(503)
      .send("ERROR: Can't create new user. Please try later.");
  }
};
