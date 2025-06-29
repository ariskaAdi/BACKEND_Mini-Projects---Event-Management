import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { EventCategory } from "../../prisma/generated/client";
import { cloudinaryUpload } from "../config/cloudinary";

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

      let uploadImage = null;
      if (req.file) {
        uploadImage = await cloudinaryUpload(req.file);
      }
      const event = await prisma.event.create({
        data: {
          title,
          description,
          location,
          price: Number(price),
          isPaid: isPaid === "true",
          startDate: start,
          endDate: end,
          organizerId: Number(organizerId),
          seats: Number(seats),
          picture: uploadImage?.secure_url || "",
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
        include: {
          organizer: {
            select: {
              name: true,
              email: true,
              profilePicture: true,
            },
          },
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
      organizerId,
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
      let uploadImage = null;
      if (req.file) {
        uploadImage = await cloudinaryUpload(req.file);
      }
      const event = await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          title,
          description,
          location,
          price: Number(price),
          isPaid: isPaid === "true",
          startDate: start,
          endDate: end,
          organizerId: Number(organizerId),
          seats: Number(seats),
          picture: uploadImage?.secure_url || "",
          category,
        },
      });
      console.log("Incoming file:", req.file?.originalname);
      console.log("Incoming body:", req.body);

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
      res.status(200).send({ success: true, message: "Event deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export default EventController;
