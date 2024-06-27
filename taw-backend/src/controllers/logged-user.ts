import { Response } from "express";
import { JWT_SECRET } from "../secret";
import { verify } from "jsonwebtoken";
import UserModel from "../../models/user";
import connectDB from "../../config/db";

export const loggedUserController = async (req: any, res: Response) => {
  connectDB();

  const { id, role } = verify(req.headers.authorization, JWT_SECRET) as any;

  /*const user = await prisma.user.findFirst({
    where: {
      id: id,
      role: role,
    },
    select: {
      role: true,
      username: true,
    },
  });*/

  /* TODO: migliorare, è fatta male solo per migrare correttamente da prisma a mongoose*/

  const user = await UserModel.findOne({
    'username': 'DonnieBrasco'
  });

  return res.json(user);
};
