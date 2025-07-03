import AppError from "../errors/AppError";
import { findUserById } from "../repositories/user.repository";

export const getUserById = async (userId: string) => {
  const user = await findUserById(Number(userId));

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
