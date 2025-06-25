import { Router } from "express";
import EventController from "../controllers/event.controller";

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
    this.route.post("/", this.eventController.createEvent);
    this.route.patch("/:id", this.eventController.updateEvent);
    this.route.delete("/:id", this.eventController.deleteEvent);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default EventRouter;
