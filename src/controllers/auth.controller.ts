import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash";
import { Role } from "../../prisma/generated/client";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { transport } from "../config/nodemailer";

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
        throw new AppError("User already exist", 400);
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

      await transport.sendMail({
        from: process.env.MAILER_SENDER,
        to: newUser.email,
        subject: "Registration successful",
        html: `
        <h1>Thank you for registering ${newUser.name}</h1>`,
      });

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
        throw new AppError("User not found", 404);
      }
      const comparePassword = await compare(password, user.password);
      if (!comparePassword) {
        throw new AppError("Invalid password", 401);
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
