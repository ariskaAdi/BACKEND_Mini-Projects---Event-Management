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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByIdToUpdatePassword = exports.findUserById = exports.CreateUser = exports.findUserByEmail = void 0;
const prisma_1 = require("../config/prisma");
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
});
exports.findUserByEmail = findUserByEmail;
const CreateUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.create({
        data,
    });
});
exports.CreateUser = CreateUser;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profilePicture: true,
            bio: true,
            points: true,
        },
    });
});
exports.findUserById = findUserById;
const findUserByIdToUpdatePassword = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profilePicture: true,
            bio: true,
            points: true,
            password: true,
        },
    });
});
exports.findUserByIdToUpdatePassword = findUserByIdToUpdatePassword;
