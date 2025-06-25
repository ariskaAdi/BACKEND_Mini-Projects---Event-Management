import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import e from "cors";
import { compare } from "bcrypt";
import { hashPassword } from "../utils/hash";
import { Role } from "../../prisma/generated/client";

class UserController {
  public async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = Number(req.params.id);
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw { rc: 404, message: "User not found" };
      }
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  }

  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = Number(req.params.id);
    const { name, profilePicture } = req.body;
    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          profilePicture,
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
    const userId = Number(req.params.id);
    const { oldPassword, newPassword } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw { rc: 404, message: "User not found" };
      }
      const comparePassword = await compare(oldPassword, user.password);
      if (!comparePassword) {
        throw { rc: 401, message: "Password is wrong" };
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
    const userId = Number(req.params.id);
    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
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
}

export default UserController;
