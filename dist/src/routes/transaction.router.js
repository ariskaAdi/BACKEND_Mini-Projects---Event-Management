"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const uploader_1 = require("../middleware/uploader");
const customerMiddleware_1 = require("../middleware/by-role/customerMiddleware");
const organizerMiddleware_1 = require("../middleware/by-role/organizerMiddleware");
class TransactionRouter {
    constructor() {
        this.route = (0, express_1.Router)();
        this.transactionController = new transaction_controller_1.TransactionController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.get("/", verifyToken_1.verifyToken, this.transactionController.getAll);
        this.route.get("/:id", verifyToken_1.verifyToken, this.transactionController.getById);
        this.route.post("/", verifyToken_1.verifyToken, this.transactionController.createdTransaction);
        this.route.patch("/:id", verifyToken_1.verifyToken, customerMiddleware_1.onlyCustomer, this.transactionController.cancelTransaction);
        this.route.patch("/payment-proof/:id", verifyToken_1.verifyToken, customerMiddleware_1.onlyCustomer, (0, uploader_1.uploaderMemory)().single("paymentProof"), this.transactionController.updateTransactionForUser);
        this.route.patch("/admin/:id", verifyToken_1.verifyToken, organizerMiddleware_1.onlyOrganizer, this.transactionController.updateTransactionForAdmin);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = TransactionRouter;
