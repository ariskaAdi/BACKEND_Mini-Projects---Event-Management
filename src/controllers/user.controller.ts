import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import e from "cors";
import { compare } from "bcrypt";
import { hashPassword } from "../utils/hash";
import { Role } from "../../prisma/generated/client";
import AppError from "../errors/AppError";
import { getUserById } from "../services/user.services";

class UserController {
  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { name, profilePicture, bio } = req.body;
    try {
      const userId = res.locals.decrypt.userId;
      const exitingUser = await getUserById(userId);
      const user = await prisma.user.update({
        where: {
          id: exitingUser.id,
        },
        data: {
          name,
          profilePicture,
          bio,
        },
      });
      res.status(200).send({ success: true, user });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.decrypt.userId;
      const exitingUser = await getUserById(userId);
      const { oldPassword, newPassword } = req.body;

      const comparePassword = await compare(oldPassword, exitingUser.password);
      if (!comparePassword) {
        throw new AppError("Invalid password", 401);
      }

      const hash = await hashPassword(newPassword);
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hash,
        },
      });
      res
        .status(200)
        .send({ success: true, message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  };

  public upgradeToOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.decrypt.userId;
      const exitingUser = await getUserById(userId);

      const user = await prisma.user.update({
        where: {
          id: exitingUser.id,
        },
        data: {
          role: Role.ORGANIZER,
        },
      });
      res.status(200).send({ success: true, user });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.decrypt.userId;
      console.log("userId from token:", userId);
      const user = await getUserById(userId);

      res.status(200).send({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
