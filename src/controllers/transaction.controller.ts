import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";

export class TransactionController {
  // get semua transaction
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await prisma.transaction.findMany({
        include: {
          user: true,
          event: true,
        },
      });
      res.status(200).send({ success: true, transaction });
    } catch (error) {
      next(error);
    }
  };

  // get transaction berdaarakan id
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      let transaction = await prisma.transaction.findUnique({
        where: {
          id,
        },
        include: {
          user: true,
          event: true,
        },
      });
      if (!transaction) {
        throw new AppError("Transaction not found", 404);
      }

      const now = new Date();
      if (
        transaction.status === "WAITING_PAYMENT" &&
        now > transaction.expiredAt
      ) {
        transaction = await prisma.transaction.update({
          where: {
            id,
          },
          data: {
            status: "EXPIRED",
          },
          include: {
            user: true,
            event: true,
          },
        });
      }
      res.status(200).send({ success: true, transaction });
    } catch (error) {
      next(error);
    }
  };

  // membuat transaction
  public createTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, eventId, quantity, totalPaid } = req.body;
    try {
      const event = await prisma.event.findUnique({
        where: {
          id: Number(eventId),
        },
      });

      if (!event) {
        throw new AppError("Event not found", 404);
      }

      if (event.seats < quantity) {
        throw new AppError("Not enough seats", 400);
      }

      const expiredAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

      const transaction = await prisma.$transaction(async (tx) => {
        // buat transaksi baru
        const cretatedTransaction = await tx.transaction.create({
          data: {
            userId: Number(userId),
            eventId: Number(eventId),
            quantity: Number(quantity),
            totalPaid: Number(totalPaid),
            expiredAt,
            status: "WAITING_PAYMENT",
          },
        });
        //   mengurangi jumlah bangku
        await tx.event.update({
          where: {
            id: Number(eventId),
          },
          data: {
            seats: {
              decrement: Number(quantity),
            },
          },
        });

        return cretatedTransaction;
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
    const id = Number(req.params.id);
    const { status, paymentProof } = req.body;

    try {
      const existing = await prisma.transaction.findUnique({
        where: {
          id,
        },
      });

      if (!existing) {
        throw new AppError("Transaction not found", 404);
      }

      const allowedStatus = [
        "WAITING_CONFIRMATION",
        "DONE",
        "REJECTED",
        "CANCELED",
      ];

      if (status && !allowedStatus.includes(status)) {
        throw new AppError("Invalid status", 400);
      }

      const updated = await prisma.transaction.update({
        where: {
          id,
        },
        data: {
          status: status || undefined,
          paymentProof: paymentProof || undefined,
        },
      });
      res.status(200).send({ success: true, updated });
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
      const action = req.body;

      if (!["done", "rejected"].includes(action)) {
        throw new AppError("Invalid action", 400);
      }

      const status = action === "done" ? "DONE" : "REJECTED";

      await prisma.transaction.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
      res
        .status(200)
        .send({ success: true, message: `Transaction marked as ${status}` });
    } catch (error) {
      next(error);
    }
  };

  //   delete transaction
  public deleteTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const id = Number(req.params.id);
    try {
      const transaction = await prisma.transaction.delete({
        where: {
          id,
        },
      });
      res.status(200).send({ success: true, transaction });
    } catch (error) {
      next(error);
    }
  };
}
