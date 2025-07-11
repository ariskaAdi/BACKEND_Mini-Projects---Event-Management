import { prisma } from "../config/prisma";

export const createVoucher = async (
  eventId: number,
  code: string,
  discount: number,
  startDate: Date,
  endDate: Date
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
    // membuat persentase harga untuk discount daari voucher
    const percentage = discount / 100;
    const newPrice = Math.max(0, Math.floor(event.price * (1 - percentage)));
    // membuat voucher untuk pertama kali
    const newVoucher = await tx.voucher.create({
      data: {
        eventId,
        code,
        discount,
        startDate,
        endDate,
      },
    });

    await tx.event.update({
      where: {
        id: eventId,
      },
      data: {
        price: newPrice,
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
