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
const prisma_1 = require("../config/prisma");
const bcrypt_1 = require("bcrypt");
const hash_1 = require("../utils/hash");
const client_1 = require("../../prisma/generated/client");
const AppError_1 = __importDefault(require("../errors/AppError"));
const user_services_1 = require("../services/user.services");
class UserController {
    constructor() {
        this.updateProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { name, profilePicture, bio } = req.body;
            try {
                const userId = res.locals.decrypt.userId;
                const exitingUser = yield (0, user_services_1.getUserById)(userId);
                const user = yield prisma_1.prisma.user.update({
                    where: {
                        id: exitingUser.id,
                    },
                    data: {
                        name,
                        profilePicture,
                        bio,
                    },
                });
                res.status(200).send({ success: true, user });
            }
            catch (error) {
                next(error);
            }
        });
        this.changePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = res.locals.decrypt.userId;
                const exitingUser = yield (0, user_services_1.getUserById)(userId);
                const { oldPassword, newPassword } = req.body;
                const comparePassword = yield (0, bcrypt_1.compare)(oldPassword, exitingUser.password);
                if (!comparePassword) {
                    throw new AppError_1.default("Invalid password", 401);
                }
                const hash = yield (0, hash_1.hashPassword)(newPassword);
                yield prisma_1.prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        password: hash,
                    },
                });
                res
                    .status(200)
                    .send({ success: true, message: "Password changed successfully" });
            }
            catch (error) {
                next(error);
            }
        });
        this.upgradeToOrganizer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = res.locals.decrypt.userId;
                const exitingUser = yield (0, user_services_1.getUserById)(userId);
                const user = yield prisma_1.prisma.user.update({
                    where: {
                        id: exitingUser.id,
                    },
                    data: {
                        role: client_1.Role.ORGANIZER,
                    },
                });
                res.status(200).send({ success: true, user });
            }
            catch (error) {
                next(error);
            }
        });
        this.getMe = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const decrypt = res.locals.decrypt;
                if (!decrypt || !decrypt.userId) {
                    throw new AppError_1.default("Unauthorized access", 401);
                }
                const userId = decrypt.userId;
                console.log("userId from token:", userId);
                const user = yield (0, user_services_1.getUserById)(userId);
                if (!user) {
                    throw new AppError_1.default("User not found", 404);
                }
                res.status(200).send({
                    success: true,
                    user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = UserController;
