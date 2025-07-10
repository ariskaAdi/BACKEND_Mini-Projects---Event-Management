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
exports.getReviewsByOrganizer = exports.findReviewByUserAndEvent = exports.createReview = exports.findTransactionByUserAndEvent = exports.getAverageRatingByOrganizerId = void 0;
const prisma_1 = require("../config/prisma");
const getAverageRatingByOrganizerId = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const avg = yield prisma_1.prisma.review.aggregate({
        where: {
            event: {
                organizerId,
            },
        },
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
    });
    return {
        averageRating: (_a = avg._avg.rating) !== null && _a !== void 0 ? _a : 0,
        totalReviews: (_b = avg._count.rating) !== null && _b !== void 0 ? _b : 0,
    };
});
exports.getAverageRatingByOrganizerId = getAverageRatingByOrganizerId;
const findTransactionByUserAndEvent = (userId, eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.transaction.findFirst({
        where: {
            userId,
            eventId,
            status: "DONE",
        },
    });
});
exports.findTransactionByUserAndEvent = findTransactionByUserAndEvent;
const createReview = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.review.create({ data });
});
exports.createReview = createReview;
const findReviewByUserAndEvent = (userId, eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.review.findFirst({
        where: { userId, eventId },
    });
});
exports.findReviewByUserAndEvent = findReviewByUserAndEvent;
const getReviewsByOrganizer = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.review.findMany({
        where: {
            event: {
                organizerId,
            },
        },
        include: {
            user: {
                select: {
                    name: true,
                    profilePicture: true,
                },
            },
            event: {
                select: {
                    title: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
});
exports.getReviewsByOrganizer = getReviewsByOrganizer;
