"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = __importDefault(require("../controllers/event.controller"));
const uploader_1 = require("../middleware/uploader");
const verifyToken_1 = require("../middleware/verifyToken");
const organizerMiddleware_1 = require("../middleware/by-role/organizerMiddleware");
class EventRouter {
    constructor() {
        this.route = (0, express_1.Router)();
        this.eventController = new event_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.get("/", this.eventController.getAll);
        this.route.get("/organizer", verifyToken_1.verifyToken, organizerMiddleware_1.onlyOrganizer, this.eventController.getAllByOrganizerId);
        this.route.get("/:id", this.eventController.getById);
        this.route.post("/", verifyToken_1.verifyToken, organizerMiddleware_1.onlyOrganizer, (0, uploader_1.uploaderMemory)().single("picture"), this.eventController.createEvent);
        this.route.patch("/:id", verifyToken_1.verifyToken, organizerMiddleware_1.onlyOrganizer, (0, uploader_1.uploaderMemory)().single("picture"), this.eventController.updateEvent);
        this.route.delete("/:id", verifyToken_1.verifyToken, organizerMiddleware_1.onlyOrganizer, this.eventController.deleteEvent);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = EventRouter;
