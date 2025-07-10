"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const verifyToken_1 = require("../middleware/verifyToken");
class UserRouter {
    constructor() {
        this.route = (0, express_1.Router)();
        this.userController = new user_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.get("/profile/get/me", verifyToken_1.verifyToken, this.userController.getMe);
        this.route.patch("/profile/:id", this.userController.updateProfile);
        this.route.patch("/change-password/:id", this.userController.changePassword);
        this.route.put("/upgrade-role/:id", this.userController.upgradeToOrganizer);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = UserRouter;
