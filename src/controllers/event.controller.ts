import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { EventCategory } from "../../prisma/generated/client";
import { cloudinaryUpload } from "../config/cloudinary";
import AppError from "../errors/AppError";

class EventController {
  public async createEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      // untuk mengambil request berdasarkan role dari jwt
      const organizerId = Number(req.body.organizerId);
      const userId = res.locals.decrypt.userId;
      const userRole = res.locals.decrypt.role;

      if (isNaN(organizerId)) {
        throw new AppError("Invalid organizer ID", 400);
      }

      if (userId !== organizerId && userRole !== "ORGANIZER") {
        throw new AppError(
          "Unauthorized: Only the organizer can create their own events",
          401
        );
      }

      // meenentukan jadwal dari event itu sendiri
      const start = new Date(startDate);
      const end = new Date(endDate);

      // pengecekan dari waktu yang diinput harus number
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError("Invalid date format", 400);
      }

      if (end <= start) {
        throw new AppError("End date must be after start date", 400);
      }

      if (start < new Date()) {
        throw new AppError("Start date must be in the future", 400);
      }

      // pengecekan jumlah bangku dan harga

      const parsedSeats = Number(seats);
      const parsedPrice = Number(price);

      if (isNaN(parsedSeats) || parsedSeats < 1) {
        throw new AppError("Seats must be a valid number >= 1", 400);
      }

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new AppError("Price must be a valid non-negative number", 400);
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
          price: parsedPrice,
          isPaid: isPaid === "true" || isPaid === true,
          startDate: start,
          endDate: end,
          organizerId: Number(organizerId),
          seats: parsedSeats,
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
        select: {
          organizer: {
            select: {
              name: true,
              email: true,
              profilePicture: true,
              bio: true,
              role: true,
            },
          },
          id: true,
          title: true,
          description: true,
          location: true,
          price: true,
          isPaid: true,
          startDate: true,
          endDate: true,
          seats: true,
          picture: true,
          category: true,
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
      category,
    } = req.body;
    try {
      const userId = res.locals.decrypt.userId;
      const userRole = res.locals.decrypt.role;

      // mengabil event terlebih dahulu
      const existingEvent = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

      // pengecekan event
      if (!existingEvent) {
        throw new AppError("Event not found", 404);
      }

      // pengecekan role dan organizerId harus sesusai dengan eventId yang telah dibuat oleh organizer tsb

      if (existingEvent.organizerId !== userId && userRole !== "ORGANIZER") {
        throw new AppError(
          "Unauthorized: You are not the owner of this event",
          401
        );
      }
      // pengecekan jadwal event
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        throw new AppError("End date must be after start date", 400);
      }

      if (start < new Date()) {
        throw new AppError("Start date must be in the future", 400);
      }

      // pengecekan jumlah bangku dan harga

      const parsedSeats = Number(seats);
      const parsedPrice = Number(price);

      if (isNaN(parsedSeats) || parsedSeats < 1) {
        throw new AppError("Seats must be a valid number >= 1", 400);
      }

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new AppError("Price must be a valid non-negative number", 400);
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
          price: parsedPrice,
          isPaid: isPaid === "true" || isPaid === true,
          startDate: start,
          endDate: end,
          organizerId: userId,
          seats: parsedSeats,
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
      const userId = res.locals.decrypt.userId;

      const existingEvent = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

      // pengecekan jika event tidak ditemukan

      if (!existingEvent) {
        throw new AppError("Event not found", 404);
      }
      // pengecekan hanya boleh diakses oleh organizer yang membuat event
      if (existingEvent.organizerId !== userId) {
        throw new AppError(
          "Unauthorized: You are not the owner of this event",
          401
        );
      }

      await prisma.event.delete({
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
