import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/AppError";

export const onlyOrganizer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const role = res.locals.decrypt.role;
  if (role !== "ORGANIZER") {
    throw new AppError("Only organizers can access this route", 403);
  }
  next();
};
