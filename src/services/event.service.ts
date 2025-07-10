import { EventCategory } from "../../prisma/generated/client";
import { CreateEventData, UpdateEventData } from "../../types/event.types";
import { cloudinaryUpload } from "../config/cloudinary";
import AppError from "../errors/AppError";
import {
  createEvent,
  deleteEvent,
  findAllEvents,
  findAllEventsByOrganizerId,
  findEventById,
  updateEventById,
} from "../repositories/event.repository";

export const createEventServices = async (data: CreateEventData) => {
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
    organizerId,
    file,
    userId,
    role,
  } = data;

  const parsedOrganizerId = Number(organizerId);
  if (isNaN(parsedOrganizerId)) {
    throw new AppError("Invalid organizer ID", 400);
  }

  if (userId !== parsedOrganizerId && role !== "ORGANIZER") {
    throw new AppError(
      "Unauthorized: Only the organizer can create their own events",
      401
    );
  }

  const start = new Date(startDate ?? "");
  const end = new Date(endDate ?? "");

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError("Invalid date format", 400);
  }

  if (end <= start) {
    throw new AppError("End date must be after start date", 400);
  }

  if (start < new Date()) {
    throw new AppError("Start date must be in the future", 400);
  }

  const parsedSeats = Number(seats);
  const parsedPrice = Number(price);

  if (isNaN(parsedSeats) || parsedSeats < 1) {
    throw new AppError("Seats must be a valid number >= 1", 400);
  }

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new AppError("Price must be a valid non-negative number", 400);
  }

  let uploadImage = null;
  if (file) {
    uploadImage = await cloudinaryUpload(file);
  }

  const isValidCategory = Object.values(EventCategory).includes(
    category as EventCategory
  );
  if (!isValidCategory) {
    throw new AppError("Invalid event category", 400);
  }

  const event = await createEvent({
    title,
    description,
    location,
    price: parsedPrice,
    isPaid: isPaid === "true" || isPaid === true,
    startDate: start,
    endDate: end,
    organizerId: parsedOrganizerId,
    seats: parsedSeats,
    picture: uploadImage?.secure_url || "",
    category: category as EventCategory,
  });

  return event;
};

export const getAllEventsServices = async (filters: {
  category?: string;
  title?: string;
  location?: string;
}) => {
  return await findAllEvents(filters);
};

export const getAllEventByOrganizerServices = async (organizerId: number) => {
  const events = await findAllEventsByOrganizerId(organizerId);

  if (!events || events.length === 0) {
    throw new AppError("No events found by this organizer", 404);
  }

  return events;
};

export const getEventByIdServices = async (id: number) => {
  const event = await findEventById(id);
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  return event;
};

export const updateEventServices = async (payload: UpdateEventData) => {
  const {
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
    file,
    userId,
    role,
  } = payload;

  const existingEvent = await findEventById(eventId);
  if (!existingEvent) throw new AppError("Event not found", 404);

  if (existingEvent.organizerId !== userId || role !== "ORGANIZER") {
    throw new AppError(
      "Unauthorized: You are not the owner of this event",
      401
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new AppError("End date must be after start date", 400);
  }

  if (start < new Date()) {
    throw new AppError("Start date must be in the future", 400);
  }

  const parsedSeats = Number(seats);
  const parsedPrice = Number(price);

  if (isNaN(parsedSeats) || parsedSeats < 1) {
    throw new AppError("Seats must be a valid number >= 1", 400);
  }

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new AppError("Price must be a valid non-negative number", 400);
  }

  let uploadImage = null;
  if (file) {
    uploadImage = await cloudinaryUpload(file);
  }

  const updatedEvent = await updateEventById(eventId, {
    title,
    description,
    location,
    price: parsedPrice,
    isPaid: isPaid === "true" || isPaid === true,
    startDate: start,
    endDate: end,
    seats: parsedSeats,
    picture: uploadImage?.secure_url || existingEvent.picture,
    category: category as EventCategory,
  });

  return updatedEvent;
};

export const deleteEventServices = async (eventId: number, userId: number) => {
  const existingEvent = await findEventById(eventId);

  if (!existingEvent) {
    throw new AppError("Event not found", 404);
  }

  if (existingEvent.organizerId !== userId) {
    throw new AppError(
      "Unauthorized: You are not the owner of this event",
      401
    );
  }

  await deleteEvent(eventId);

  return true;
};
