import { Response } from "express";
import prisma from "../../prisma/prisma_db_connection";
import { JWT_SECRET } from "../secret";
import { verify } from "jsonwebtoken";

export const loggedUserController = async (req: any, res: Response) => {
  const { id, role } = verify(req.headers.authorization, JWT_SECRET) as any;
  const user = await prisma.user.findFirst({
    where: {
      id: id,
      role: role,
    },
    select: {
      role: true,
      username: true,
    },
  });
  return res.json(user);
};
