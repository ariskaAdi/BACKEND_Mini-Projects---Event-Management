import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { verifyToken } from "../middleware/verifyToken";
import { onlyCustomer } from "../middleware/by-role/customerMiddleware";

class ReviewRouter {
  private route: Router;
  private reviewController: ReviewController;

  constructor() {
    this.route = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get(
      "/organizer/:organizerId/rating",
      this.reviewController.getOrganizerRating
    );
    this.route.post(
      "/event/:eventId",
      verifyToken,
      onlyCustomer,
      this.reviewController.createReview
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default ReviewRouter;
