import { TransactionStatus } from "../../prisma/generated/client";
import { prisma } from "../config/prisma";

export const findTransactionById = async (id: number) => {
  return prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      event: true,
    },
  });
};

export const findExpiredTransactions = async (userId: number, role: string) => {
  return await prisma.transaction.findMany({
    where: {
      status: "WAITING_PAYMENT",
      expiredAt: { lt: new Date() },
      ...(role === "CUSTOMER"
        ? { userId }
        : { event: { organizerId: userId } }),
    },
    include: {
      event: true,
    },
  });
};

export const expireTransactionById = async (
  transactionId: number,
  quantity: number
) => {
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: "EXPIRED",
      event: {
        update: {
          seats: { increment: quantity },
        },
      },
    },
  });
};

//  Get all transactions by role and status
export const findAllTransactionsByRoleAndStatus = async (
  userId: number,
  role: string,
  status?: TransactionStatus
) => {
  const whereClause =
    role === "CUSTOMER"
      ? {
          userId,
          ...(status ? { status } : {}),
        }
      : {
          event: {
            organizerId: userId,
          },
          ...(status ? { status } : {}),
        };

  return await prisma.transaction.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          ...(role === "ORGANIZER" ? { profilePicture: true } : {}),
        },
      },
      event: true,
    },
  });
};

export const findEventByIdForTransaction = async (eventId: number) => {
  return await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      seats: true,
      price: true,
    },
  });
};

export const createTransactionWithSeatUpdate = async (
  userId: number,
  eventId: number,
  quantity: number,
  totalPaid: number,
  expiredAt: Date
) => {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        quantity,
        totalPaid,
        expiredAt,
        status: "WAITING_PAYMENT",
      },
    });

    await tx.event.update({
      where: { id: eventId },
      data: {
        seats: {
          decrement: quantity,
        },
      },
    });

    return transaction;
  });
};

export const updateTransactionPaymentProof = async ({
  id,
  paymentProof,
  status,
}: {
  id: number;
  paymentProof: string;
  status: "WAITING_CONFIRMATION" | "WAITING_PAYMENT";
}) => {
  return await prisma.transaction.update({
    where: { id },
    data: {
      paymentProof,
      status,
    },
  });
};

export const updateTransactionStatus = async ({
  id,
  status,
}: {
  id: number;
  status: "DONE" | "REJECTED";
}) => {
  return await prisma.transaction.update({
    where: { id },
    data: { status },
  });
};

// Cancel transaksi dan rollback kursi event
export const cancelTransactionAndRollbackSeats = async ({
  id,
  quantity,
  eventId,
}: {
  id: number;
  quantity: number;
  eventId: number;
}) => {
  return await prisma.$transaction(async (tx) => {
    const updatedTransaction = await tx.transaction.update({
      where: { id },
      data: { status: "CANCELED" },
    });

    await tx.event.update({
      where: { id: eventId },
      data: {
        seats: {
          increment: quantity,
        },
      },
    });

    return updatedTransaction;
  });
};
