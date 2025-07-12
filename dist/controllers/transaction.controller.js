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
exports.TransactionController = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const transaction_service_1 = require("../services/transaction.service");
class TransactionController {
    constructor() {
        // get semua transaction
        this.getAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const rawStatus = req.query.status;
                const userId = res.locals.decrypt.userId;
                const role = res.locals.decrypt.role;
                const transactions = yield (0, transaction_service_1.getAllTransactionsService)({
                    status: rawStatus,
                    userId,
                    role,
                });
                res.status(200).send({ success: true, transactions });
            }
            catch (error) {
                next(error);
            }
        });
        // get transaction berdaarakan id
        this.getById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            try {
                const userId = res.locals.decrypt.userId;
                if (!userId)
                    throw new AppError_1.default("User not found", 404);
                const transaction = yield (0, transaction_service_1.getTransactionByIdService)(id, userId);
                res.status(200).send({ success: true, transaction });
            }
            catch (error) {
                next(error);
            }
        });
        // membuat transaction
        this.createdTransaction = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = res.locals.decrypt.userId;
                const { eventId, quantity, totalPaid, voucherCode, usedPoints } = req.body;
                const parsedEventId = Number(eventId);
                const parsedQuantity = Number(quantity);
                const parsedTotalPaid = Number(totalPaid);
                const parsedUsedPoints = usedPoints ? Number(usedPoints) : 0;
                if (isNaN(parsedEventId) ||
                    isNaN(parsedQuantity) ||
                    isNaN(parsedTotalPaid)) {
                    throw new AppError_1.default("Invalid input: eventId, quantity, or totalPaid must be numbers", 400);
                }
                const transaction = yield (0, transaction_service_1.createTransactionService)({
                    userId,
                    eventId: parsedEventId,
                    quantity: parsedQuantity,
                    totalPaid: parsedTotalPaid,
                    voucherCode,
                    usedPoints: parsedUsedPoints,
                });
                res.status(201).send({ success: true, transaction });
            }
            catch (error) {
                next(error);
            }
        });
        //   update transation jika ada pembayaran untuk user
        this.updateTransactionForUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const userId = res.locals.decrypt.userId;
                const result = yield (0, transaction_service_1.updateTransactionForUserService)({
                    id,
                    userId,
                    file: req.file,
                });
                res.status(200).send({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        });
        // cancel transaction untuk user jika ingin membatalkan pesanan
        this.cancelTransaction = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const userId = res.locals.decrypt.userId;
                const { transaction, message } = yield (0, transaction_service_1.cancelTransactionService)({
                    id,
                    userId,
                });
                res.status(200).send({ success: true, message, transaction });
            }
            catch (error) {
                next(error);
            }
        });
        //   UPDATE TRANSAKSI UNTUK ADMIN
        this.updateTransactionForAdmin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const userId = res.locals.decrypt.userId;
                const { action } = req.body;
                const { transaction, message } = yield (0, transaction_service_1.updateTransactionForAdminService)({
                    id,
                    userId,
                    action,
                });
                res.status(200).send({
                    success: true,
                    message,
                    transaction,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.TransactionController = TransactionController;
