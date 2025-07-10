"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyOrganizer = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const onlyOrganizer = (req, res, next) => {
    const role = res.locals.decrypt.role;
    if (role !== "ORGANIZER") {
        throw new AppError_1.default("Only organizers can access this route", 403);
    }
    next();
};
exports.onlyOrganizer = onlyOrganizer;
