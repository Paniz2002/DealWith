import { Request, Response } from "express";
import prisma from "../../prisma/prisma_db_connection";
import { compareSync } from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../schema/secret";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  let user = await prisma.user.findFirst({ where: { username } });
  if (!user) {
    throw new NotFoundException(
      "User does not exists",
      ErrorCode.USER_NOT_FOUND,
    );
  }
  if (!compareSync(password, user.password)) {
    throw new BadRequestException(
      "Invalid Password",
      ErrorCode.INCORRECT_PASSWORD,
    );
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_SECRET,
  );

  return res.json({ token });
};
