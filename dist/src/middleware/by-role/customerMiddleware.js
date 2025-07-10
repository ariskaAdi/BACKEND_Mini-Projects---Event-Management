"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyCustomer = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const onlyCustomer = (req, res, next) => {
    const role = res.locals.decrypt.role;
    if (role !== "CUSTOMER") {
        throw new AppError_1.default("Only customers can access this route", 403);
    }
    next();
};
exports.onlyCustomer = onlyCustomer;
