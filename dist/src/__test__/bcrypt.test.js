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
const bcrypt_1 = __importDefault(require("bcrypt"));
const hash_1 = require("../utils/hash");
jest.mock("bcrypt");
describe("test hashing password", () => {
    it("should return hashed password", () => __awaiter(void 0, void 0, void 0, function* () {
        bcrypt_1.default.hash.mockResolvedValue("fake-hashedPassword");
        const newPassword = yield (0, hash_1.hashPassword)("1234");
        expect(newPassword).toBe("fake-hashedPassword");
    }));
});
