import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import AppError from "../errors/AppError";
import { verify } from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new AppError("Token not found", 401);
    }

    const decoded = verify(token, process.env.TOKEN_KEY || "secret");
    res.locals.decrypt = decoded;
    next();
  } catch (error) {
    next(new AppError("Unauthorized", 401));
  }
};
