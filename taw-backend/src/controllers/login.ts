import { Request, Response } from "express";
import prisma from "../../prisma/prisma_db_connection";
import { compareSync } from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../schema/secret";
import BadRequestException from "../exceptions/bad-request";
import NotFoundException from "../exceptions/not-found";

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  let user = await prisma.user.findFirst({ where: { username } });
  if (!user) {
    return NotFoundException(req, res, "User does not exists");
  }
  if (!compareSync(password, user.password)) {
    return BadRequestException(req, res, "Invalid Password");
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
