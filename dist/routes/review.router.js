"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const customerMiddleware_1 = require("../middleware/by-role/customerMiddleware");
class ReviewRouter {
    constructor() {
        this.route = (0, express_1.Router)();
        this.reviewController = new review_controller_1.ReviewController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.get("/organizer/:organizerId/rating", this.reviewController.getOrganizerRating);
        this.route.post("/event/:eventId", verifyToken_1.verifyToken, customerMiddleware_1.onlyCustomer, this.reviewController.createReview);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = ReviewRouter;
