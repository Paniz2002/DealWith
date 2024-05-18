import { Request, Response } from "express";
const BadRequestException = (req: Request, res: Response, message: string) => {
  return res.status(400).json({
    message: message,
  });
};

export default BadRequestException;

