import { Request, Response } from "express";
import prisma from "../../prisma/prisma_db_connection";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
const formValidator = z.object({
  email: z.string().email(),
  name: z.string().optional(),
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
    if (e instanceof z.ZodError) {
      console.log("Error while validating input:", e.issues);
    }
    return false;
  }
};
export const registerController = async (req: Request, res: Response) => {
  const isValid = validateForm(req.body);
  if (!isValid) {
    return res.status(404).send("User input error.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  await prisma.user.create({
    data: {
      name: req.body.name ?? "",
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
    },
  });
  return res.status(200).send("OK");
};
