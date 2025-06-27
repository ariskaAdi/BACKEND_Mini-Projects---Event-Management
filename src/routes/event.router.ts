import { Router } from "express";
import EventController from "../controllers/event.controller";
import { uploaderMemory } from "../middleware/uploader";

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
    this.route.get("/:id", this.eventController.getById);
    this.route.post(
      "/",
      uploaderMemory().single("picture"),
      this.eventController.createEvent
    );
    this.route.patch(
      "/:id",
      uploaderMemory().single("picture"),
      this.eventController.updateEvent
    );
    this.route.delete("/:id", this.eventController.deleteEvent);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default EventRouter;
