import { Request, Response } from "express";
export const logoutController = async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  return res.sendStatus(200);
};
