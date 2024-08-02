import { Request, Response } from "express";
import BadRequestException from "../exceptions/bad-request";
import { z } from "zod";
export const validateForm = (
  req: Request,
  res: Response,
  input: unknown,
  formValidator: any,
) => {
  try {
    formValidator.parse(input);
    return true;
  } catch (e) {
    if (e instanceof z.ZodError) {
      let errors = e.errors.map((err) => err.message);
      return BadRequestException(req, res, errors.join("; "));
    } else return BadRequestException(req, res, "Invalid input");
  }
};
