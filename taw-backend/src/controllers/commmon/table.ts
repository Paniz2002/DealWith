import { TableStatus } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../../../prisma/prisma_db_connection";
import BadRequestException from "src/exceptions/bad-request";
import InternalException from "src/exceptions/internal-exception";
export const tableController = async (req: Request, res: Response) => {
  try {
    let result;
    const { status } = req.query;
    switch (status) {
      case "free":
        result = await prisma.table.findMany({
          where: {
            status: TableStatus.FREE,
          },
          select: {
            id: true,
            maxCustomers: true,
          },
        });
        return res.status(200).json(result);
      case "occupied":
        result = await prisma.table.findMany({
          where: {
            status: TableStatus.OCCUPIED,
          },
          select: {
            id: true,
            maxCustomers: true,
          },
        });
        return res.status(200).json(result);
      default:
        return BadRequestException(req, res, "Invalid parameter.");
    }
  } catch (e) {
    return InternalException(req, res, "Unknown error.");
  }
};
