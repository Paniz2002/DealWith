import { Request, Response } from "express";
import prisma from "../../prisma/prisma_db_connection";
import { z } from "zod";
import bcrypt from "bcryptjs";
const formValidator = z
  .object({
    email: z.string().email(),
    name: z.string().optional(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((form) => {
    form.password === form.confirmPassword,
      {
        message: "Passwords do not match.",
      };
  });

const validateForm = (input: unknown) => {
  try {
    const isValid = formValidator.parse(input);
    return isValid;
  } catch (e) {
    return false;
  }
};
export const register = async (req: Request, res: Response) => {
  const isValid = validateForm(req.body);
  if (!isValid) {
    return res.status(404).send("User input error.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  await prisma.user.create({
    data: {
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name ?? "",
    },
  });
  return res.status(200).send("OK");
};
