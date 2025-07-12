import { DiscountType } from "../../prisma/generated/client";
import { prisma } from "../config/prisma";

export const createVoucher = async (
  eventId: number,
  code: string,
  discount: number,
  startDate: Date,
  endDate: Date,
  quota: number,
  discountType: DiscountType = DiscountType.FIXED
) => {
  const voucher = await prisma.$transaction(async (tx) => {
    // mengambil event berdasarkan id nya dulu
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });
    // melakukan pengecekan apakah event nya ada
    if (!event) {
      throw new Error("Event not found");
    }
    const existingCode = await tx.voucher.findUnique({ where: { code } });
    if (existingCode) {
      throw new Error("Voucher code already exists");
    }

    // membuat voucher untuk pertama kali
    const newVoucher = await tx.voucher.create({
      data: {
        eventId,
        code,
        discount,
        startDate,
        endDate,
        quota,
        discountType,
      },
    });

    return newVoucher;
  });
  return voucher;
};

export const findVoucherByEventId = async (eventId: number) => {
  const voucher = await prisma.voucher.findMany({
    where: {
      eventId,
      // startDate: { lte: new Date() },
      // endDate: { gte: new Date() },
    },
    orderBy: {
      startDate: "desc",
    },
  });
  return voucher;
};

export const getAllVoucher = async () => {
  const voucher = await prisma.voucher.findMany({
    include: {
      event: true,
      usages: true,
    },
  });
  return voucher;
};
