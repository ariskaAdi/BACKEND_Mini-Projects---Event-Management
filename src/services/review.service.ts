import {
  createReview,
  findReviewByUserAndEvent,
  findTransactionByUserAndEvent,
  getAverageRatingByOrganizerId,
} from "../repositories/review.repository";
import AppError from "../errors/AppError";
import { CreateReviewPayload } from "../types/review.type";

export const getOrganizerRatingService = async (organizerId: number) => {
  if (isNaN(organizerId)) {
    throw new AppError("Invalid organizer ID", 400);
  }

  return await getAverageRatingByOrganizerId(organizerId);
};

export const createReviewService = async (
  data: CreateReviewPayload
): Promise<any> => {
  const { userId, eventId, rating, comment } = data;

  if (rating < 1 || rating > 5) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }

  const hasAttended = await findTransactionByUserAndEvent(userId, eventId);
  if (!hasAttended) {
    throw new AppError("You can only review events you attended", 403);
  }

  const existingReview = await findReviewByUserAndEvent(userId, eventId);
  if (existingReview) {
    throw new AppError("You have already reviewed this event", 400);
  }

  return await createReview({ userId, eventId, rating, comment });
};
