import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash";
import { Role } from "../../prisma/generated/client";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

class AuthController {
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { name, email, password, referralCode } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        throw { rc: 400, success: false, message: "User already exist" };
      }

      const generatedReferral = Math.random().toString(36).substring(2, 8);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: await hashPassword(password),
          role: Role.CUSTOMER, // ✅ default role
          referralCode: generatedReferral,
          referredBy: referralCode || undefined,
        },
      });
      if (referralCode) {
        await prisma.user.update({
          where: { referralCode },
          data: {
            points: { increment: 10000 },
          },
        });

        await prisma.coupon.create({
          data: {
            userId: newUser.id,
            code: `REF-${generatedReferral}`,
            discount: 10000,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });
      }

      res
        .status(201)
        .send({ message: "User registered", newUser, success: true });
    } catch (error) {
      next(error);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        throw { rc: 404, message: "User not exist" };
      }
      const comparePassword = await compare(password, user.password);
      if (!comparePassword) {
        throw { rc: 401, message: "Password is wrong" };
      }

      const token = sign(
        {
          id: user.id,
          role: user.role,
        },
        process.env.TOKEN_KEY || "secret",
        {
          expiresIn: "24h",
        }
      );

      res
        .status(200)
        .send({ message: "Login success", user, token, success: true });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
