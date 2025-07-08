import { CreateReviewPayload } from "../../types/review.type";
import { prisma } from "../config/prisma";

export const getAverageRatingByOrganizerId = async (organizerId: number) => {
  const avg = await prisma.review.aggregate({
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
    averageRating: avg._avg.rating ?? 0,
    totalReviews: avg._count.rating ?? 0,
  };
};

export const findTransactionByUserAndEvent = async (
  userId: number,
  eventId: number
) => {
  return await prisma.transaction.findFirst({
    where: {
      userId,
      eventId,
      status: "DONE",
    },
  });
};

export const createReview = async (data: CreateReviewPayload) => {
  return await prisma.review.create({ data });
};

export const findReviewByUserAndEvent = async (
  userId: number,
  eventId: number
) => {
  return await prisma.review.findFirst({
    where: { userId, eventId },
  });
};

export const getReviewsByOrganizer = async (organizerId: number) => {
  return await prisma.review.findMany({
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
};
