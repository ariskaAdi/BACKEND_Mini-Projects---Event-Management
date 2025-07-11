import { TransactionStatus } from "../../prisma/generated/client";
import { CreateTransactionInput } from "../types/transaction.type";
import { cloudinaryUpload } from "../config/cloudinary";
import AppError from "../errors/AppError";
import {
  cancelTransactionAndRollbackSeats,
  createTransactionWithVoucherAndPoints,
  expireTransactionById,
  findAllTransactionsByRoleAndStatus,
  findEventByIdForTransaction,
  findExpiredTransactions,
  findTransactionById,
  findVoucherByCode,
  updateTransactionPaymentProof,
  updateTransactionStatus,
} from "../repositories/transaction.repository";

export const getAllTransactionsService = async ({
  status,
  userId,
  role,
}: {
  status?: string;
  userId: number;
  role: string;
}) => {
  if (!userId || !role) throw new AppError("Unauthorized access", 401);

  const allowedStatuses: TransactionStatus[] = [
    "WAITING_PAYMENT",
    "WAITING_CONFIRMATION",
    "EXPIRED",
    "CANCELED",
    "DONE",
    "REJECTED",
  ];

  const upperStatus = status?.toUpperCase() as TransactionStatus | undefined;

  if (upperStatus && !allowedStatuses.includes(upperStatus)) {
    throw new AppError("Invalid transaction status", 400);
  }

  if (!["CUSTOMER", "ORGANIZER"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  //  Expire old transactions
  const expiredTransactions = await findExpiredTransactions(userId, role);

  await Promise.all(
    expiredTransactions.map((tx) => expireTransactionById(tx.id, tx.quantity))
  );

  //  Get all transactions
  const transactions = await findAllTransactionsByRoleAndStatus(
    userId,
    role,
    upperStatus
  );

  return transactions;
};

export const getTransactionByIdService = async (id: number, userId: number) => {
  const transaction = await findTransactionById(id);

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  //  Cek hak akses
  if (
    transaction.userId !== userId &&
    transaction.event.organizerId !== userId
  ) {
    throw new AppError("Forbidden", 403);
  }

  //  Cek apakah sudah expired
  const now = new Date();
  if (transaction.status === "WAITING_PAYMENT" && now > transaction.expiredAt) {
    return await expireTransactionById(transaction.id, transaction.quantity);
  }

  return transaction;
};

export const createTransactionService = async ({
  userId,
  eventId,
  quantity,
  totalPaid,
  voucherCode,
  usedPoints = 0,
}: CreateTransactionInput & { voucherCode?: string; usedPoints?: number }) => {
  const event = await findEventByIdForTransaction(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.seats < quantity) {
    throw new AppError("Not enough seats", 400);
  }

  const totalBeforeDiscount = event.price * quantity;

  let discountAmount = 0;
  let voucher = null;

  if (voucherCode) {
    voucher = await findVoucherByCode(voucherCode);

    if (!voucher || voucher.eventId !== eventId) {
      throw new AppError("Invalid voucher", 400);
    }

    const now = new Date();
    if (voucher.startDate > now || voucher.endDate < now) {
      throw new AppError("Voucher not valid at this time", 400);
    }

    if (voucher.used >= voucher.quota) {
      throw new AppError("Voucher quota exceeded", 400);
    }

    discountAmount =
      voucher.discountType === "PERCENTAGE"
        ? Math.floor((totalBeforeDiscount * voucher.discount) / 100)
        : voucher.discount * quantity;
  }

  const expectedTotal = Math.max(
    0,
    totalBeforeDiscount - discountAmount - usedPoints
  );

  if (expectedTotal !== totalPaid) {
    throw new AppError("Total paid doesn't match expected total", 400);
  }

  const expiredAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 jam

  const transaction = await createTransactionWithVoucherAndPoints({
    userId,
    eventId,
    quantity,
    totalPaid: expectedTotal,
    expiredAt,
    usedPoints,
    voucherId: voucher?.id ?? null,
  });

  return transaction;
};

export const updateTransactionForUserService = async ({
  id,
  userId,
  file,
}: {
  id: number;
  userId: number;
  file?: Express.Multer.File;
}) => {
  const transaction = await findTransactionById(id);

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.userId !== userId) {
    throw new AppError("Unauthorized access", 403);
  }

  let paymentProof = "";
  if (file) {
    const uploaded = await cloudinaryUpload(file);
    paymentProof = uploaded.secure_url;
  }

  const newStatus = paymentProof ? "WAITING_CONFIRMATION" : "WAITING_PAYMENT";

  await updateTransactionPaymentProof({
    id,
    paymentProof,
    status: newStatus,
  });

  return {
    message: "Proof updated. Wait for admin confirmation",
  };
};

export const updateTransactionForAdminService = async ({
  id,
  userId,
  action,
}: {
  id: number;
  userId: number;
  action: string;
}) => {
  if (!["done", "rejected"].includes(action)) {
    throw new AppError("Invalid action", 400);
  }

  const transaction = await findTransactionById(id);

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.event.organizerId !== userId) {
    throw new AppError("Unauthorized access", 403);
  }

  const status = action === "done" ? "DONE" : "REJECTED";

  const updatedTransaction = await updateTransactionStatus({ id, status });

  return {
    transaction: updatedTransaction,
    message: `Transaction marked as ${status}`,
  };
};

export const cancelTransactionService = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  const transaction = await findTransactionById(id);

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.userId !== userId) {
    throw new AppError("Unauthorized access", 403);
  }

  const cancelableStatuses = ["WAITING_PAYMENT", "WAITING_CONFIRMATION"];
  if (!cancelableStatuses.includes(transaction.status)) {
    throw new AppError("Transaction cannot be canceled at this stage", 400);
  }

  const updatedTransaction = await cancelTransactionAndRollbackSeats({
    id,
    quantity: transaction.quantity,
    eventId: transaction.event.id,
  });

  return {
    message: "Transaction canceled successfully",
    transaction: updatedTransaction,
  };
};
