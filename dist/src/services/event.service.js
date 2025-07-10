"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventServices = exports.updateEventServices = exports.getEventByIdServices = exports.getAllEventByOrganizerServices = exports.getAllEventsServices = exports.createEventServices = void 0;
const client_1 = require("../../prisma/generated/client");
const cloudinary_1 = require("../config/cloudinary");
const AppError_1 = __importDefault(require("../errors/AppError"));
const event_repository_1 = require("../repositories/event.repository");
const createEventServices = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, location, price, isPaid, startDate, endDate, seats, category, organizerId, file, userId, role, } = data;
    const parsedOrganizerId = Number(organizerId);
    if (isNaN(parsedOrganizerId)) {
        throw new AppError_1.default("Invalid organizer ID", 400);
    }
    if (userId !== parsedOrganizerId && role !== "ORGANIZER") {
        throw new AppError_1.default("Unauthorized: Only the organizer can create their own events", 401);
    }
    const start = new Date(startDate !== null && startDate !== void 0 ? startDate : "");
    const end = new Date(endDate !== null && endDate !== void 0 ? endDate : "");
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError_1.default("Invalid date format", 400);
    }
    if (end <= start) {
        throw new AppError_1.default("End date must be after start date", 400);
    }
    if (start < new Date()) {
        throw new AppError_1.default("Start date must be in the future", 400);
    }
    const parsedSeats = Number(seats);
    const parsedPrice = Number(price);
    if (isNaN(parsedSeats) || parsedSeats < 1) {
        throw new AppError_1.default("Seats must be a valid number >= 1", 400);
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new AppError_1.default("Price must be a valid non-negative number", 400);
    }
    let uploadImage = null;
    if (file) {
        uploadImage = yield (0, cloudinary_1.cloudinaryUpload)(file);
    }
    const isValidCategory = Object.values(client_1.EventCategory).includes(category);
    if (!isValidCategory) {
        throw new AppError_1.default("Invalid event category", 400);
    }
    const event = yield (0, event_repository_1.createEvent)({
        title,
        description,
        location,
        price: parsedPrice,
        isPaid: isPaid === "true" || isPaid === true,
        startDate: start,
        endDate: end,
        organizerId: parsedOrganizerId,
        seats: parsedSeats,
        picture: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.secure_url) || "",
        category: category,
    });
    return event;
});
exports.createEventServices = createEventServices;
const getAllEventsServices = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, event_repository_1.findAllEvents)(filters);
});
exports.getAllEventsServices = getAllEventsServices;
const getAllEventByOrganizerServices = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield (0, event_repository_1.findAllEventsByOrganizerId)(organizerId);
    if (!events || events.length === 0) {
        throw new AppError_1.default("No events found by this organizer", 404);
    }
    return events;
});
exports.getAllEventByOrganizerServices = getAllEventByOrganizerServices;
const getEventByIdServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield (0, event_repository_1.findEventById)(id);
    if (!event) {
        throw new AppError_1.default("Event not found", 404);
    }
    return event;
});
exports.getEventByIdServices = getEventByIdServices;
const updateEventServices = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, title, description, location, price, isPaid, startDate, endDate, seats, category, file, userId, role, } = payload;
    const existingEvent = yield (0, event_repository_1.findEventById)(eventId);
    if (!existingEvent)
        throw new AppError_1.default("Event not found", 404);
    if (existingEvent.organizerId !== userId || role !== "ORGANIZER") {
        throw new AppError_1.default("Unauthorized: You are not the owner of this event", 401);
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
        throw new AppError_1.default("End date must be after start date", 400);
    }
    if (start < new Date()) {
        throw new AppError_1.default("Start date must be in the future", 400);
    }
    const parsedSeats = Number(seats);
    const parsedPrice = Number(price);
    if (isNaN(parsedSeats) || parsedSeats < 1) {
        throw new AppError_1.default("Seats must be a valid number >= 1", 400);
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new AppError_1.default("Price must be a valid non-negative number", 400);
    }
    let uploadImage = null;
    if (file) {
        uploadImage = yield (0, cloudinary_1.cloudinaryUpload)(file);
    }
    const updatedEvent = yield (0, event_repository_1.updateEventById)(eventId, {
        title,
        description,
        location,
        price: parsedPrice,
        isPaid: isPaid === "true" || isPaid === true,
        startDate: start,
        endDate: end,
        seats: parsedSeats,
        picture: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.secure_url) || existingEvent.picture,
        category: category,
    });
    return updatedEvent;
});
exports.updateEventServices = updateEventServices;
const deleteEventServices = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingEvent = yield (0, event_repository_1.findEventById)(eventId);
    if (!existingEvent) {
        throw new AppError_1.default("Event not found", 404);
    }
    if (existingEvent.organizerId !== userId) {
        throw new AppError_1.default("Unauthorized: You are not the owner of this event", 401);
    }
    yield (0, event_repository_1.deleteEvent)(eventId);
    return true;
});
exports.deleteEventServices = deleteEventServices;
