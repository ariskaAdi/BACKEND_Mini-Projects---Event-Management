import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { EventCategory } from "../../prisma/generated/client";

class EventController {
  public async createEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const organizerId = Number(req.body.organizerId);
    const {
      title,
      description,
      location,
      price,
      isPaid,
      startDate,
      endDate,
      seats,
      picture,
      category,
    } = req.body;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        throw { rc: 400, message: "End date must be after start date" };
      }

      if (start < new Date()) {
        throw { rc: 400, message: "Start date must be in the future" };
      }
      const event = await prisma.event.create({
        data: {
          title,
          description,
          location,
          price,
          isPaid,
          startDate: start,
          endDate: end,
          organizerId: Number(organizerId),
          seats,
          picture,
          category,
        },
      });
      res.status(200).send({ success: true, event });
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
      const events = await prisma.event.findMany({
        where: {
          category: category ? (category as EventCategory) : undefined,
          title: title
            ? { contains: title as string, mode: "insensitive" }
            : undefined,
          location: location
            ? { contains: location as string, mode: "insensitive" }
            : undefined,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      res.status(200).send({ success: true, events });
    } catch (error) {
      next(error);
    }
  }

  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const eventId = Number(req.params.id);
    try {
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });
      if (!event) {
        throw { rc: 404, message: "Event not found" };
      }
      res.status(200).send({ success: true, event });
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
    const {
      title,
      description,
      location,
      price,
      isPaid,
      startDate,
      endDate,
      seats,
      picture,
      organizer,
      category,
    } = req.body;
    try {
      const event = await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          title,
          description,
          location,
          price,
          isPaid: isPaid(false),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          organizer,
          seats,
          picture,
          category,
        },
      });
      res.status(200).send({ success: true, event });
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
    try {
      const event = await prisma.event.delete({
        where: {
          id: eventId,
        },
      });
      res.status(200).send({ success: true, event });
    } catch (error) {
      next(error);
    }
  }
}

export default EventController;
