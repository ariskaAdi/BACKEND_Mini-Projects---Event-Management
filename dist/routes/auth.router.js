"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_1 = require("../middleware/validation/auth");
class AuthRouter {
    constructor() {
        this.route = (0, express_1.Router)();
        this.authController = new auth_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.post("/register", auth_1.regisValidation, this.authController.register);
        this.route.post("/login", auth_1.loginValidation, this.authController.login);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = AuthRouter;
