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
    const { eventId, quantity, totalPaid } = req.body;
    try {
      const userId = res.locals.decrypt.userId;
      const transaction = await createTransactionService({
        userId,
        eventId: Number(eventId),
        quantity: Number(quantity),
        totalPaid: Number(totalPaid),
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
