import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/AppError";

export const onlyCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const role = res.locals.decrypt.role;
  if (role !== "CUSTOMER") {
    throw new AppError("Only customers can access this route", 403);
  }
  next();
};
