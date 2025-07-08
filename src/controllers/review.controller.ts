import { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  getOrganizerRatingService,
} from "../services/review.service";

export class ReviewController {
  public getOrganizerRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const organizerId = Number(req.params.organizerId);

      const data = await getOrganizerRatingService(organizerId);

      res.status(200).json({
        success: true,
        message: "Organizer rating fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = res.locals.decrypt.userId;
      const { eventId, rating, comment } = req.body;

      const review = await createReviewService({
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
    } catch (error) {
      next(error);
    }
  };
}
