import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { findTransactionById } from "../repositories/transaction.repository";
import { cloudinaryUpload } from "../config/cloudinary";
import { TransactionStatus } from "../../prisma/generated/client";
import {
  cancelTransactionService,
  createTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  updateTransactionForAdminService,
  updateTransactionForUserService,
} from "../services/transaction.service";

export class TransactionController {
  // get semua transaction
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawStatus = req.query.status as string | undefined;
      const userId = res.locals.decrypt.userId;
      const role = res.locals.decrypt.role;

      const transactions = await getAllTransactionsService({
        status: rawStatus,
        userId,
        role,
      });

      res.status(200).send({ success: true, transactions });
    } catch (error) {
      next(error);
    }
  };

  // get transaction berdaarakan id
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      const userId = res.locals.decrypt.userId;
      if (!userId) throw new AppError("User not found", 404);

      const transaction = await getTransactionByIdService(id, userId);

      res.status(200).send({ success: true, transaction });
    } catch (error) {
      next(error);
    }
  };

  // membuat transaction
  public createdTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = res.locals.decrypt.userId;
      const { eventId, quantity, totalPaid, voucherCode, usedPoints } =
        req.body;

      const parsedEventId = Number(eventId);
      const parsedQuantity = Number(quantity);
      const parsedTotalPaid = Number(totalPaid);
      const parsedUsedPoints = usedPoints ? Number(usedPoints) : 0;

      if (
        isNaN(parsedEventId) ||
        isNaN(parsedQuantity) ||
        isNaN(parsedTotalPaid)
      ) {
        throw new AppError(
          "Invalid input: eventId, quantity, or totalPaid must be numbers",
          400
        );
      }
      const transaction = await createTransactionService({
        userId,
        eventId: parsedEventId,
        quantity: parsedQuantity,
        totalPaid: parsedTotalPaid,
        voucherCode,
        usedPoints: parsedUsedPoints,
      });
      res.status(201).send({ success: true, transaction });
    } catch (error) {
      next(error);
    }
  };

  //   update transation jika ada pembayaran untuk user

  public updateTransactionForUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = Number(req.params.id);
      const userId = res.locals.decrypt.userId;

      const result = await updateTransactionForUserService({
        id,
        userId,
        file: req.file,
      });

      res.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // cancel transaction untuk user jika ingin membatalkan pesanan
  public cancelTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = Number(req.params.id);
      const userId = res.locals.decrypt.userId;

      const { transaction, message } = await cancelTransactionService({
        id,
        userId,
      });

      res.status(200).send({ success: true, message, transaction });
    } catch (error) {
      next(error);
    }
  };

  //   UPDATE TRANSAKSI UNTUK ADMIN
  public updateTransactionForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = Number(req.params.id);
      const userId = res.locals.decrypt.userId;
      const { action } = req.body;

      const { transaction, message } = await updateTransactionForAdminService({
        id,
        userId,
        action,
      });

      res.status(200).send({
        success: true,
        message,
        transaction,
      });
    } catch (error) {
      next(error);
    }
  };
}
