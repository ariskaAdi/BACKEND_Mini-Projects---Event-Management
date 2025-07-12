"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucher_controller_1 = __importDefault(require("../controllers/voucher.controller"));
const verifyToken_1 = require("../middleware/verifyToken");
const organizerMiddleware_1 = require("../middleware/by-role/organizerMiddleware");
class VoucherRouter {
    constructor() {
        this.route = (0, express_1.Router)();
        this.voucherController = new voucher_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.get("/", this.voucherController.getAllVoucher);
        this.route.get("/:eventId", this.voucherController.getVoucherByEventId);
        this.route.post("/", verifyToken_1.verifyToken, organizerMiddleware_1.onlyOrganizer, this.voucherController.createVoucher);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = VoucherRouter;
