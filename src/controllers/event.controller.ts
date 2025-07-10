import { NextFunction, Request, Response } from "express";
import { EventCategory } from "../../prisma/generated/client";
import AppError from "../errors/AppError";
import {
  createEventServices,
  deleteEventServices,
  getAllEventByOrganizerServices,
  getAllEventsServices,
  getEventByIdServices,
  updateEventServices,
} from "../services/event.service";

class EventController {
  public async createEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // untuk mengambil request berdasarkan role dari jwt

      const userId = res.locals.decrypt.userId;

      const result = await createEventServices({
        ...req.body,
        file: req.file,
        organizerId: userId,
        userId,
        role: "ORGANIZER",
      });
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);
      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  }

  public async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { category, title, location } = req.query;
    try {
      if (
        category &&
        !Object.values(EventCategory).includes(category as EventCategory)
      ) {
        throw new AppError("Invalid event category", 400);
      }

      const result = await getAllEventsServices({
        category: category as EventCategory,
        title: title as string,
        location: location as string,
      });
      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  }

  public async getAllByOrganizerId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = res.locals.decrypt.userId;

      if (!userId) throw new AppError("User not found", 404);
      const result = await getAllEventByOrganizerServices(userId);

      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  }

  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return next(new AppError("Invalid event ID", 400));
      }

      const result = await getEventByIdServices(eventId);
      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  }

  public async updateEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      return next(new AppError("Invalid event ID", 400));
    }

    const {
      title,
      description,
      location,
      price,
      isPaid,
      startDate,
      endDate,
      seats,
      category,
    } = req.body;

    try {
      const userId = res.locals.decrypt.userId;
      const role = res.locals.decrypt.role;

      const updatedEvent = await updateEventServices({
        eventId,
        title,
        description,
        location,
        price,
        isPaid,
        startDate,
        endDate,
        seats,
        category,
        file: req.file,
        userId,
        role,
      });

      res.status(200).send({ success: true, event: updatedEvent });
    } catch (error) {
      next(error);
    }
  }

  public async deleteEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      return next(new AppError("Invalid event ID", 400));
    }
    try {
      const userId = res.locals.decrypt.userId;
      await deleteEventServices(eventId, userId);

      res.status(200).send({ success: true, message: "Event deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export default EventController;
