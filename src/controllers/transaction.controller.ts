import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { findTransactionById } from "../repositories/transaction.repository";
import { cloudinaryUpload } from "../config/cloudinary";
import { TransactionStatus } from "../../prisma/generated/client";

export class TransactionController {
  // get semua transaction
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.decrypt.userId;
      const role = res.locals.decrypt.role;

      if (!userId && !role) {
        throw new AppError("unauthorized access", 400);
      }

      // pengecekan akses untuk masing-masing role
      let transactions;
      if (role === "CUSTOMER") {
        transactions = await prisma.transaction.findMany({
          where: {
            userId,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            event: true,
          },
        });
      } else if (role === "ORGANIZER") {
        transactions = await prisma.transaction.findMany({
          where: {
            event: {
              organizerId: userId,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profilePicture: true,
              },
            },
            event: true,
          },
        });
      } else {
        throw new AppError("invalid role", 400);
      }
      res.status(200).send({ success: true, transactions });
    } catch (error) {
      next(error);
    }
  };

  // get transaction berdaarakan id
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      // pengecekan user dari token
      const userId = res.locals.decrypt.userId;

      if (!userId) {
        throw new AppError("User not found", 404);
      }

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

      // pengecekan hanya user yang membuat transaksi dan organizer yang membuat event yang dapat mengakses
      if (
        transaction.userId !== userId &&
        transaction.event.organizerId !== userId
      ) {
        throw new AppError("Forbidden", 403);
      }
      // pengecekan status transaksi jika melibihkan waktu expired maka satus dan seats akan berubah
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
            event: {
              update: {
                seats: {
                  increment: transaction.quantity,
                },
              },
            },
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

  // get transaction by status
  public getByStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const status = req.params.status.toUpperCase() as TransactionStatus;

    try {
      const userId = res.locals.decrypt.userId;

      if (!userId) {
        throw new AppError("User not found", 404);
      }

      const allowedStatuses: TransactionStatus[] = ["WAITING_PAYMENT"];
      if (!allowedStatuses.includes(status)) {
        throw new AppError("Invalid transaction status", 400);
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          status,
        },
        include: {
          user: true,
          event: true,
        },
      });
      res.status(200).send({ success: true, transactions });
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
      const event = await prisma.event.findUnique({
        where: {
          id: Number(eventId),
        },
        select: {
          id: true,
          seats: true,
          price: true,
        },
      });

      if (!event) {
        throw new AppError("Event not found", 404);
      }

      if (event.seats < quantity) {
        throw new AppError("Not enough seats", 400);
      }

      const expectedTotalPaid = event.price * quantity;
      if (expectedTotalPaid !== Number(totalPaid)) {
        throw new AppError("Invalid total paid", 400);
      }

      const expiredAt = new Date(Date.now() + 2 * 60 * 1000);

      const transaction = await prisma.$transaction(async (tx) => {
        // buat transaksi baru
        const cretatedTransaction = await tx.transaction.create({
          data: {
            userId: Number(userId),
            eventId: Number(eventId),
            quantity: Number(quantity),
            totalPaid: expectedTotalPaid,
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
    try {
      const { id } = req.params;
      const userId = res.locals.decrypt.userId;

      const transaction = await findTransactionById(Number(id));
      if (!transaction) {
        throw new AppError("Transaction not found", 404);
      }

      if (transaction.userId !== userId) {
        throw new AppError("Unauthorized access", 403);
      }

      let paymentProof = "";
      if (req.file) {
        const uploaded = await cloudinaryUpload(req.file);
        paymentProof = uploaded.secure_url;
      }

      const newStatus = paymentProof
        ? "WAITING_CONFIRMATION"
        : "WAITING_PAYMENT";

      await prisma.transaction.update({
        where: {
          id: Number(id),
        },
        data: {
          paymentProof: paymentProof,
          status: newStatus,
        },
      });
      console.log("DECRYPTED JWT PAYLOAD:", res.locals.decrypt.userId);

      res.status(200).send({
        success: true,
        message: "proof updated. wait for admin confirmation",
      });
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
      const userId = res.locals.decrypt.userId;
      const id = Number(req.params.id);
      const action = req.body.action;

      if (!["done", "rejected"].includes(action)) {
        throw new AppError("Invalid action", 400);
      }
      const existingTransaction = await findTransactionById(id);

      if (!existingTransaction) {
        throw new AppError("Transaction not found", 404);
      }

      // pengecekan yang boleh hanya organizer id dari token yang boleh melakukan update ini

      if (existingTransaction.event.organizerId !== userId) {
        throw new AppError("Unauthorized access", 403);
      }

      const status = action === "done" ? "DONE" : "REJECTED";

      const updatedTransaction = await prisma.transaction.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      res.status(200).send({
        success: true,
        message: `Transaction marked as ${status}`,
        transaction: updatedTransaction,
      });
    } catch (error) {
      next(error);
    }
  };
}
