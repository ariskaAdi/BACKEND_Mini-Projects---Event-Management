import { prisma } from "../config/prisma";

export const findTransactionById = async (id: number) => {
  return prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      event: true,
    },
  });
};
