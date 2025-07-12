import { TransactionStatus } from "../../prisma/generated/client";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";

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

export const createTransactionWithVoucherAndPoints = async ({
  userId,
  eventId,
  quantity,
  totalPaid,
  expiredAt,
  usedPoints = 0,
  voucherId = null,
}: {
  userId: number;
  eventId: number;
  quantity: number;
  totalPaid: number;
  expiredAt: Date;
  usedPoints?: number;
  voucherId?: number | null;
}) => {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        quantity,
        totalPaid,
        expiredAt,
        usedPoints,
        voucherId,
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

    if (voucherId !== null) {
      await tx.voucher.update({
        where: { id: voucherId },
        data: {
          used: { increment: 1 },
        },
      });

      await tx.voucherUsage.create({
        data: {
          userId,
          voucherId,
        },
      });
    }

    if (usedPoints > 0) {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError("User not found", 404);
      if (user.points < usedPoints)
        throw new AppError("Not enough points", 400);

      await tx.user.update({
        where: { id: userId },
        data: {
          points: { decrement: usedPoints },
        },
      });
    }

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

export const findVoucherByCode = async (code: string) => {
  return await prisma.voucher.findUnique({
    where: { code },
    include: {
      event: true,
    },
  });
};
