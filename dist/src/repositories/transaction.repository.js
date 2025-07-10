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
exports.cancelTransactionAndRollbackSeats = exports.updateTransactionStatus = exports.updateTransactionPaymentProof = exports.createTransactionWithSeatUpdate = exports.findEventByIdForTransaction = exports.findAllTransactionsByRoleAndStatus = exports.expireTransactionById = exports.findExpiredTransactions = exports.findTransactionById = void 0;
const prisma_1 = require("../config/prisma");
const findTransactionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
            event: true,
        },
    });
});
exports.findTransactionById = findTransactionById;
const findExpiredTransactions = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.transaction.findMany({
        where: Object.assign({ status: "WAITING_PAYMENT", expiredAt: { lt: new Date() } }, (role === "CUSTOMER"
            ? { userId }
            : { event: { organizerId: userId } })),
        include: {
            event: true,
        },
    });
});
exports.findExpiredTransactions = findExpiredTransactions;
const expireTransactionById = (transactionId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.transaction.update({
        where: { id: transactionId },
        data: {
            status: "EXPIRED",
            event: {
                update: {
                    seats: { increment: quantity },
                },
            },
        },
    });
});
exports.expireTransactionById = expireTransactionById;
//  Get all transactions by role and status
const findAllTransactionsByRoleAndStatus = (userId, role, status) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = role === "CUSTOMER"
        ? Object.assign({ userId }, (status ? { status } : {})) : Object.assign({ event: {
            organizerId: userId,
        } }, (status ? { status } : {}));
    return yield prisma_1.prisma.transaction.findMany({
        where: whereClause,
        include: {
            user: {
                select: Object.assign({ id: true, email: true, name: true }, (role === "ORGANIZER" ? { profilePicture: true } : {})),
            },
            event: true,
        },
    });
});
exports.findAllTransactionsByRoleAndStatus = findAllTransactionsByRoleAndStatus;
const findEventByIdForTransaction = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.event.findUnique({
        where: { id: eventId },
        select: {
            id: true,
            seats: true,
            price: true,
        },
    });
});
exports.findEventByIdForTransaction = findEventByIdForTransaction;
const createTransactionWithSeatUpdate = (userId, eventId, quantity, totalPaid, expiredAt) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const transaction = yield tx.transaction.create({
            data: {
                userId,
                eventId,
                quantity,
                totalPaid,
                expiredAt,
                status: "WAITING_PAYMENT",
            },
        });
        yield tx.event.update({
            where: { id: eventId },
            data: {
                seats: {
                    decrement: quantity,
                },
            },
        });
        return transaction;
    }));
});
exports.createTransactionWithSeatUpdate = createTransactionWithSeatUpdate;
const updateTransactionPaymentProof = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, paymentProof, status, }) {
    return yield prisma_1.prisma.transaction.update({
        where: { id },
        data: {
            paymentProof,
            status,
        },
    });
});
exports.updateTransactionPaymentProof = updateTransactionPaymentProof;
const updateTransactionStatus = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, status, }) {
    return yield prisma_1.prisma.transaction.update({
        where: { id },
        data: { status },
    });
});
exports.updateTransactionStatus = updateTransactionStatus;
// Cancel transaksi dan rollback kursi event
const cancelTransactionAndRollbackSeats = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, quantity, eventId, }) {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedTransaction = yield tx.transaction.update({
            where: { id },
            data: { status: "CANCELED" },
        });
        yield tx.event.update({
            where: { id: eventId },
            data: {
                seats: {
                    increment: quantity,
                },
            },
        });
        return updatedTransaction;
    }));
});
exports.cancelTransactionAndRollbackSeats = cancelTransactionAndRollbackSeats;
