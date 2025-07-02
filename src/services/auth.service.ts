import { hashPassword } from "../utils/hash";
import AppError from "../errors/AppError";
import { transport } from "../config/nodemailer";
import { prisma } from "../config/prisma";
import { Role } from "../../prisma/generated/client";
import { CreateUser, findUserByEmail } from "../repositories/user.repository";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

export const registerService = async (data: any) => {
  const { name, email, password, referralCode } = data;
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exist", 400);
  }

  const generatedReferral = Math.random().toString(36).substring(2, 8);

  const newUser = await CreateUser({
    email,
    name,
    password: await hashPassword(password),
    role: Role.CUSTOMER,
    referralCode: generatedReferral,
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
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Account Created",
    html: `<h1>Thank you for registering ${newUser.name}</h1>`,
  });
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginService = async (data: any) => {
  const { email, password } = data;
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const comparePassword = await compare(password, user.password);
  if (!comparePassword) {
    throw new AppError("Invalid password", 401);
  }

  const token = sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.TOKEN_KEY || "secret",
    {
      expiresIn: "24h",
    }
  );

  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
  };
};
