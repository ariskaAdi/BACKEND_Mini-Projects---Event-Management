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
exports.getAllvoucherServices = exports.getVoucherByEventIdServices = exports.createVoucherServices = void 0;
const transaction_repository_1 = require("../repositories/transaction.repository");
const AppError_1 = __importDefault(require("../errors/AppError"));
const voucher_repository_1 = require("../repositories/voucher.repository");
const client_1 = require("../../prisma/generated/client");
const createVoucherServices = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, code, discount, startDate, endDate, quota, discountType = client_1.DiscountType.FIXED, } = input;
    //   mengambil dari request body
    // mengambil event berdasarkan id
    const now = new Date();
    const event = yield (0, transaction_repository_1.findEventByIdForTransaction)(eventId);
    if (!event) {
        throw new AppError_1.default("Event not found", 404);
    }
    //   validasi agar voucher masuk akal
    // VALIDASI INPUT
    if (discount < 0)
        throw new AppError_1.default("Discount must be >= 0", 400);
    if (quota <= 0)
        throw new AppError_1.default("Quota must be > 0", 400);
    if (startDate >= endDate)
        throw new AppError_1.default("Start date must be before end date", 400);
    if (endDate <= now)
        throw new AppError_1.default("Voucher end date must be in the future", 400);
    const voucher = yield (0, voucher_repository_1.createVoucher)(eventId, code, discount, startDate, endDate, quota, discountType);
    return voucher;
});
exports.createVoucherServices = createVoucherServices;
const getVoucherByEventIdServices = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield (0, voucher_repository_1.findVoucherByEventId)(eventId);
    // console.log("Found voucher:", voucher);
    if (!voucher || (Array.isArray(voucher) && voucher.length === 0)) {
        throw new AppError_1.default("Voucher not found", 404);
    }
    return voucher;
});
exports.getVoucherByEventIdServices = getVoucherByEventIdServices;
const getAllvoucherServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield (0, voucher_repository_1.getAllVoucher)();
    if (!voucher || (Array.isArray(voucher) && voucher.length === 0)) {
        throw new AppError_1.default("Voucher not found", 404);
    }
    return voucher;
});
exports.getAllvoucherServices = getAllvoucherServices;
