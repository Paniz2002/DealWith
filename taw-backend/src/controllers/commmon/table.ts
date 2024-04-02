import { TableStatus } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../../../prisma/prisma_db_connection";
import BadRequestException from "../../exceptions/bad-request";
import InternalException from "../../exceptions/internal-exception";
export const tableController = async (req: Request, res: Response) => {
  try {
    let result;
    let { status } = req.query;
    status = status!.toString().toLowerCase();
    let filters = {
      where: {},
      select: {
        id: true,
        maxCustomers: true,
      },
    };
    if (!["free", "occupied"].includes(status))
      return BadRequestException(req, res, "Invalid parameter.");
    filters.where =
      status === "free"
        ? { status: TableStatus.FREE }
        : { status: TableStatus.OCCUPIED };
    result = await prisma.table.findMany(filters);
    return result;
  } catch (e) {
    console.error(e);
    return InternalException(req, res, "Unknown error, try again later.");
  }
};
