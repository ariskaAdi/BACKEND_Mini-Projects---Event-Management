import AppError from "../errors/AppError";
import { findUserByIdToUpdatePassword } from "../repositories/user.repository";

export const getUserById = async (userId: string) => {
  const user = await findUserByIdToUpdatePassword(Number(userId));

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
