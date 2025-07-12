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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelTransactionService = exports.updateTransactionForAdminService = exports.updateTransactionForUserService = exports.createTransactionService = exports.getTransactionByIdService = exports.getAllTransactionsService = void 0;
const cloudinary_1 = require("../config/cloudinary");
const AppError_1 = __importDefault(require("../errors/AppError"));
const transaction_repository_1 = require("../repositories/transaction.repository");
const getAllTransactionsService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ status, userId, role, }) {
    if (!userId || !role)
        throw new AppError_1.default("Unauthorized access", 401);
    const allowedStatuses = [
        "WAITING_PAYMENT",
        "WAITING_CONFIRMATION",
        "EXPIRED",
        "CANCELED",
        "DONE",
        "REJECTED",
    ];
    const upperStatus = status === null || status === void 0 ? void 0 : status.toUpperCase();
    if (upperStatus && !allowedStatuses.includes(upperStatus)) {
        throw new AppError_1.default("Invalid transaction status", 400);
    }
    if (!["CUSTOMER", "ORGANIZER"].includes(role)) {
        throw new AppError_1.default("Invalid role", 400);
    }
    //  Expire old transactions
    const expiredTransactions = yield (0, transaction_repository_1.findExpiredTransactions)(userId, role);
    yield Promise.all(expiredTransactions.map((tx) => (0, transaction_repository_1.expireTransactionById)(tx.id, tx.quantity)));
    //  Get all transactions
    const transactions = yield (0, transaction_repository_1.findAllTransactionsByRoleAndStatus)(userId, role, upperStatus);
    return transactions;
});
exports.getAllTransactionsService = getAllTransactionsService;
const getTransactionByIdService = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield (0, transaction_repository_1.findTransactionById)(id);
    if (!transaction) {
        throw new AppError_1.default("Transaction not found", 404);
    }
    //  Cek hak akses
    if (transaction.userId !== userId &&
        transaction.event.organizerId !== userId) {
        throw new AppError_1.default("Forbidden", 403);
    }
    //  Cek apakah sudah expired
    const now = new Date();
    if (transaction.status === "WAITING_PAYMENT" && now > transaction.expiredAt) {
        return yield (0, transaction_repository_1.expireTransactionById)(transaction.id, transaction.quantity);
    }
    return transaction;
});
exports.getTransactionByIdService = getTransactionByIdService;
const createTransactionService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, eventId, quantity, totalPaid, voucherCode, usedPoints = 0, }) {
    var _b;
    const event = yield (0, transaction_repository_1.findEventByIdForTransaction)(eventId);
    if (!event) {
        throw new AppError_1.default("Event not found", 404);
    }
    if (event.seats < quantity) {
        throw new AppError_1.default("Not enough seats", 400);
    }
    const totalBeforeDiscount = event.price * quantity;
    let discountAmount = 0;
    let voucher = null;
    if (voucherCode) {
        voucher = yield (0, transaction_repository_1.findVoucherByCode)(voucherCode);
        if (!voucher || voucher.eventId !== eventId) {
            throw new AppError_1.default("Invalid voucher", 400);
        }
        const now = new Date();
        if (voucher.startDate > now || voucher.endDate < now) {
            throw new AppError_1.default("Voucher not valid at this time", 400);
        }
        if (voucher.used >= voucher.quota) {
            throw new AppError_1.default("Voucher quota exceeded", 400);
        }
        discountAmount =
            voucher.discountType === "PERCENTAGE"
                ? Math.floor((totalBeforeDiscount * voucher.discount) / 100)
                : voucher.discount * quantity;
    }
    const expectedTotal = Math.max(0, totalBeforeDiscount - discountAmount - usedPoints);
    if (expectedTotal !== totalPaid) {
        throw new AppError_1.default("Total paid doesn't match expected total", 400);
    }
    const expiredAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 jam
    const transaction = yield (0, transaction_repository_1.createTransactionWithVoucherAndPoints)({
        userId,
        eventId,
        quantity,
        totalPaid: expectedTotal,
        expiredAt,
        usedPoints,
        voucherId: (_b = voucher === null || voucher === void 0 ? void 0 : voucher.id) !== null && _b !== void 0 ? _b : null,
    });
    return transaction;
});
exports.createTransactionService = createTransactionService;
const updateTransactionForUserService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, userId, file, }) {
    const transaction = yield (0, transaction_repository_1.findTransactionById)(id);
    if (!transaction) {
        throw new AppError_1.default("Transaction not found", 404);
    }
    if (transaction.userId !== userId) {
        throw new AppError_1.default("Unauthorized access", 403);
    }
    let paymentProof = "";
    if (file) {
        const uploaded = yield (0, cloudinary_1.cloudinaryUpload)(file);
        paymentProof = uploaded.secure_url;
    }
    const newStatus = paymentProof ? "WAITING_CONFIRMATION" : "WAITING_PAYMENT";
    yield (0, transaction_repository_1.updateTransactionPaymentProof)({
        id,
        paymentProof,
        status: newStatus,
    });
    return {
        message: "Proof updated. Wait for admin confirmation",
    };
});
exports.updateTransactionForUserService = updateTransactionForUserService;
const updateTransactionForAdminService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, userId, action, }) {
    if (!["done", "rejected"].includes(action)) {
        throw new AppError_1.default("Invalid action", 400);
    }
    const transaction = yield (0, transaction_repository_1.findTransactionById)(id);
    if (!transaction) {
        throw new AppError_1.default("Transaction not found", 404);
    }
    if (transaction.event.organizerId !== userId) {
        throw new AppError_1.default("Unauthorized access", 403);
    }
    const status = action === "done" ? "DONE" : "REJECTED";
    const updatedTransaction = yield (0, transaction_repository_1.updateTransactionStatus)({ id, status });
    return {
        transaction: updatedTransaction,
        message: `Transaction marked as ${status}`,
    };
});
exports.updateTransactionForAdminService = updateTransactionForAdminService;
const cancelTransactionService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, userId, }) {
    const transaction = yield (0, transaction_repository_1.findTransactionById)(id);
    if (!transaction) {
        throw new AppError_1.default("Transaction not found", 404);
    }
    if (transaction.userId !== userId) {
        throw new AppError_1.default("Unauthorized access", 403);
    }
    const cancelableStatuses = ["WAITING_PAYMENT", "WAITING_CONFIRMATION"];
    if (!cancelableStatuses.includes(transaction.status)) {
        throw new AppError_1.default("Transaction cannot be canceled at this stage", 400);
    }
    const updatedTransaction = yield (0, transaction_repository_1.cancelTransactionAndRollbackSeats)({
        id,
        quantity: transaction.quantity,
        eventId: transaction.event.id,
    });
    return {
        message: "Transaction canceled successfully",
        transaction: updatedTransaction,
    };
});
exports.cancelTransactionService = cancelTransactionService;
