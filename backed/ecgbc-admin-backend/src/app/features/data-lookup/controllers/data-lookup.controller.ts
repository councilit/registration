import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../config/error.config";
import prisma from "../../../config/db.config";

export const getDataLookups = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`filter`,req.filters);
    
    const [lookups, total] = await Promise.all([prisma.dataLookup.findMany({
      where: {...req.filters},
    }),
    prisma.dataLookup.count({where:{...req.filters}})]
)

    res.status(200).json({
      status: "success",
      data: {
        lookups,
        meta: {
          total,
        },
      },
    });
  }
);
