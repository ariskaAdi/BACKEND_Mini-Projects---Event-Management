"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVoucher = exports.findVoucherByEventId = exports.createVoucher = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma_1 = require("../config/prisma");
const createVoucher = (eventId_1, code_1, discount_1, startDate_1, endDate_1, quota_1, ...args_1) => __awaiter(void 0, [eventId_1, code_1, discount_1, startDate_1, endDate_1, quota_1, ...args_1], void 0, function* (eventId, code, discount, startDate, endDate, quota, discountType = client_1.DiscountType.FIXED) {
    const voucher = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // mengambil event berdasarkan id nya dulu
        const event = yield tx.event.findUnique({
            where: { id: eventId },
        });
        // melakukan pengecekan apakah event nya ada
        if (!event) {
            throw new Error("Event not found");
        }
        const existingCode = yield tx.voucher.findUnique({ where: { code } });
        if (existingCode) {
            throw new Error("Voucher code already exists");
        }
        // membuat voucher untuk pertama kali
        const newVoucher = yield tx.voucher.create({
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
    }));
    return voucher;
});
exports.createVoucher = createVoucher;
const findVoucherByEventId = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield prisma_1.prisma.voucher.findMany({
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
});
exports.findVoucherByEventId = findVoucherByEventId;
const getAllVoucher = () => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield prisma_1.prisma.voucher.findMany({
        include: {
            event: true,
            usages: true,
        },
    });
    return voucher;
});
exports.getAllVoucher = getAllVoucher;
