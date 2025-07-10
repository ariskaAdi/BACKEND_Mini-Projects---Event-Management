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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginService = exports.registerService = void 0;
const hash_1 = require("../utils/hash");
const AppError_1 = __importDefault(require("../errors/AppError"));
const nodemailer_1 = require("../config/nodemailer");
const prisma_1 = require("../config/prisma");
const client_1 = require("../../prisma/generated/client");
const user_repository_1 = require("../repositories/user.repository");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const registerService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, referralCode } = data;
    const existingUser = yield (0, user_repository_1.findUserByEmail)(email);
    if (existingUser) {
        throw new AppError_1.default("User already exist", 400);
    }
    const generatedReferral = Math.random().toString(36).substring(2, 8);
    const newUser = yield (0, user_repository_1.CreateUser)({
        email,
        name,
        password: yield (0, hash_1.hashPassword)(password),
        role: client_1.Role.CUSTOMER,
        referralCode: generatedReferral,
    });
    if (referralCode) {
        yield prisma_1.prisma.user.update({
            where: { referralCode },
            data: {
                points: { increment: 10000 },
            },
        });
        yield prisma_1.prisma.coupon.create({
            data: {
                userId: newUser.id,
                code: `REF-${generatedReferral}`,
                discount: 10000,
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
        });
    }
    yield nodemailer_1.transport.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Account Created",
        html: `<h1>Thank you for registering ${newUser.name}</h1>`,
    });
    const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
    return userWithoutPassword;
});
exports.registerService = registerService;
const loginService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = data;
    const user = yield (0, user_repository_1.findUserByEmail)(email);
    if (!user) {
        throw new AppError_1.default("User not found", 404);
    }
    const comparePassword = yield (0, bcrypt_1.compare)(password, user.password);
    if (!comparePassword) {
        throw new AppError_1.default("Invalid password", 401);
    }
    const token = (0, jsonwebtoken_1.sign)({
        userId: user.id,
        role: user.role,
    }, process.env.TOKEN_KEY || "secret", {
        expiresIn: "24h",
    });
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    return {
        user: userWithoutPassword,
        token,
    };
});
exports.loginService = loginService;
