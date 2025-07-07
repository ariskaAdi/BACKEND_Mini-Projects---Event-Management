import { User } from "../../prisma/generated/client";
import { prisma } from "../config/prisma";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

type CreateUser = Omit<
  User,
  | "id"
  | "profilePicture"
  | "createdAt"
  | "updatedAt"
  | "points"
  | "referredBy"
  | "bio"
> & {
  role: User["role"];
  referralCode: User["referralCode"];
};

export const CreateUser = async (data: CreateUser) => {
  return prisma.user.create({
    data,
  });
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePicture: true,
      bio: true,
      points: true,
    },
  });
};

export const findUserByIdToUpdatePassword = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePicture: true,
      bio: true,
      points: true,
      password: true,
    },
  });
};
