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
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const supertest_1 = __importDefault(require("supertest"));
const appTest = new app_1.default().app;
describe("Connection Testing API", () => {
    beforeEach(() => {
        // Menyiapkan program/function yang ingin dijalankan
        // sebelum tiap skenario dieksekusi
    });
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Menyiapkan program yang ingin dijalankan sebelum seluruh skenario dijalankan
        yield prisma_1.prisma.$connect();
    }));
    afterEach(() => {
        // Menyiapkan program/function yang ingin dijalankan
        // sesudah tiap skenario dieksekusi
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Menyiapkan program yang ingin dijalankan sesudah seluruh skenario dijalankan
        yield prisma_1.prisma.$disconnect();
    }));
    // Testing scenario
    // GOOD CASE
    it("Should return welcome message from main route", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(appTest).get("/");
        expect(response.status).toBe(200);
        expect(response.text).toEqual("<h1>Welcome to the API</h1>");
    }));
    // BAD CASE
    it("Should return NOT FOUND PAGE", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(appTest).get("/transactions");
        expect(response.status).toBe(404);
    }));
});
