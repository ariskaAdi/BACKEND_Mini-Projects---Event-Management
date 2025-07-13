import { NextFunction, Request } from "express";
import { findEventByIdForTransaction } from "../repositories/transaction.repository";
import AppError from "../errors/AppError";
import {
  createVoucher,
  findVoucherByEventId,
  getAllVoucher,
} from "../repositories/voucher.repository";
import { IVoucher } from "../types/voucher.types";
import { DiscountType } from "../../prisma/generated/client";

export const createVoucherServices = async (input: IVoucher) => {
  const {
    eventId,
    code,
    discount,
    startDate,
    endDate,
    quota,
    discountType = DiscountType.FIXED,
  } = input;
  //   mengambil dari request body
  // mengambil event berdasarkan id

  const now = new Date();
  const event = await findEventByIdForTransaction(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  //   validasi agar voucher masuk akal
  // VALIDASI INPUT
  if (discount < 0) throw new AppError("Discount must be >= 0", 400);
  if (quota <= 0) throw new AppError("Quota must be > 0", 400);
  if (startDate >= endDate)
    throw new AppError("Start date must be before end date", 400);
  if (endDate <= now)
    throw new AppError("Voucher end date must be in the future", 400);

  const voucher = await createVoucher(
    eventId,
    code,
    discount,
    startDate,
    endDate,
    quota,
    discountType
  );
  return voucher;
};

export const getVoucherByEventIdServices = async (eventId: number) => {
  const vouchers = await findVoucherByEventId(eventId);
  // console.log("Found voucher:", voucher);
  if (!vouchers || vouchers.length === 0) {
    throw new AppError("No valid vouchers found", 404);
  }

  // Filter voucher yang masih valid (kuota tersisa)
  const validVouchers = vouchers.filter(
    (voucher) => voucher.used < voucher.quota
  );

  if (validVouchers.length === 0) {
    throw new AppError("All vouchers are used up", 400);
  }
  return validVouchers;
};

export const getAllvoucherServices = async () => {
  const voucher = await getAllVoucher();
  if (!voucher || (Array.isArray(voucher) && voucher.length === 0)) {
    throw new AppError("Voucher not found", 404);
  }
  return voucher;
};
