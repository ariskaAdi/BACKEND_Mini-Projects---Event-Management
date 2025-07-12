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
const voucher_service_1 = require("../services/voucher.service");
const AppError_1 = __importDefault(require("../errors/AppError"));
class VoucherController {
    constructor() {
        this.getAllVoucher = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, voucher_service_1.getAllvoucherServices)();
                res.status(200).send({ success: true, result });
            }
            catch (error) {
                next(error);
            }
        });
        this.getVoucherByEventId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const eventId = Number(req.params.eventId);
                if (isNaN(eventId)) {
                    throw new AppError_1.default("Invalid event ID", 400);
                }
                const result = yield (0, voucher_service_1.getVoucherByEventIdServices)(eventId);
                res.status(200).send({ success: true, result });
            }
            catch (error) {
                next(error);
            }
        });
        this.createVoucher = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId, discount, code, startDate, endDate, quota, discountType, } = req.body;
                if (!eventId || !discount || !code || !startDate || !endDate || !quota) {
                    throw new AppError_1.default("Missing required fields", 400);
                }
                const userId = res.locals.decrypt.userId;
                const result = yield (0, voucher_service_1.createVoucherServices)({
                    eventId: Number(eventId),
                    discount: Number(discount),
                    code: String(code),
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    quota: Number(quota),
                    discountType,
                });
                res.status(200).send({ success: true, result });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = VoucherController;
