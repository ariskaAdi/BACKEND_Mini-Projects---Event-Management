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
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
class ReviewController {
    constructor() {
        this.getOrganizerRating = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const organizerId = Number(req.params.organizerId);
                const data = yield (0, review_service_1.getOrganizerRatingService)(organizerId);
                res.status(200).json({
                    success: true,
                    message: "Organizer rating fetched successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.createReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = res.locals.decrypt.userId;
                const { eventId, rating, comment } = req.body;
                const review = yield (0, review_service_1.createReviewService)({
                    userId,
                    eventId: Number(eventId),
                    rating: Number(rating),
                    comment,
                });
                res.status(201).json({
                    success: true,
                    message: "Review submitted successfully",
                    review,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ReviewController = ReviewController;
