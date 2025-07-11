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
exports.createReviewService = exports.getOrganizerRatingService = void 0;
const review_repository_1 = require("../repositories/review.repository");
const AppError_1 = __importDefault(require("../errors/AppError"));
const getOrganizerRatingService = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(organizerId)) {
        throw new AppError_1.default("Invalid organizer ID", 400);
    }
    return yield (0, review_repository_1.getAverageRatingByOrganizerId)(organizerId);
});
exports.getOrganizerRatingService = getOrganizerRatingService;
const createReviewService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, eventId, rating, comment } = data;
    if (rating < 1 || rating > 5) {
        throw new AppError_1.default("Rating must be between 1 and 5", 400);
    }
    const hasAttended = yield (0, review_repository_1.findTransactionByUserAndEvent)(userId, eventId);
    if (!hasAttended) {
        throw new AppError_1.default("You can only review events you attended", 403);
    }
    const existingReview = yield (0, review_repository_1.findReviewByUserAndEvent)(userId, eventId);
    if (existingReview) {
        throw new AppError_1.default("You have already reviewed this event", 400);
    }
    return yield (0, review_repository_1.createReview)({ userId, eventId, rating, comment });
});
exports.createReviewService = createReviewService;
