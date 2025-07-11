import { Router } from "express";
import EventController from "../controllers/event.controller";
import { uploaderMemory } from "../middleware/uploader";
import { verifyToken } from "../middleware/verifyToken";
import { onlyOrganizer } from "../middleware/by-role/organizerMiddleware";

class EventRouter {
  private route: Router;
  private eventController: EventController;

  constructor() {
    this.route = Router();
    this.eventController = new EventController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get("/", this.eventController.getAll);
    this.route.get(
      "/organizer",
      verifyToken,
      onlyOrganizer,
      this.eventController.getAllByOrganizerId
    );
    this.route.get("/:id", this.eventController.getById);

    this.route.post(
      "/",
      verifyToken,
      onlyOrganizer,
      uploaderMemory().single("picture"),
      this.eventController.createEvent
    );
    this.route.patch(
      "/:id",
      verifyToken,
      onlyOrganizer,
      uploaderMemory().single("picture"),
      this.eventController.updateEvent
    );
    this.route.delete(
      "/:id",
      verifyToken,
      onlyOrganizer,
      this.eventController.deleteEvent
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default EventRouter;
