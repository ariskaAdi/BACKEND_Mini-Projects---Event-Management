import { NextFunction, Request } from "express";
import { findEventByIdForTransaction } from "../repositories/transaction.repository";
import AppError from "../errors/AppError";
import {
  createVoucher,
  findVoucherByEventId,
} from "../repositories/voucher.repository";
import { IVoucher } from "../types/voucher.types";

export const createVoucherServices = async (input: IVoucher) => {
  const { eventId, code, startDate, endDate, discount } = input;
  //   mengambil dari request body
  // mengambil event berdasarkan id

  const now = new Date();
  const event = await findEventByIdForTransaction(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  //   validasi agar voucher masuk akal
  if (endDate < now) {
    throw new AppError("Voucher end date must be in the future", 400);
  }

  if (startDate >= endDate) {
    throw new AppError("Start date must be before end date", 400);
  }

  const voucher = await createVoucher(
    eventId,
    code,
    discount,
    startDate,
    endDate
  );
  return voucher;
};

export const getVoucherByEventIdServices = async (eventId: number) => {
  const voucher = await findVoucherByEventId(eventId);
  // console.log("Found voucher:", voucher);
  if (!voucher || (Array.isArray(voucher) && voucher.length === 0)) {
    throw new AppError("Voucher not found", 404);
  }
  return voucher;
};
