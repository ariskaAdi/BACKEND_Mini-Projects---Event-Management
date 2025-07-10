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
const client_1 = require("../../prisma/generated/client");
const AppError_1 = __importDefault(require("../errors/AppError"));
const event_service_1 = require("../services/event.service");
class EventController {
    createEvent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // untuk mengambil request berdasarkan role dari jwt
                const userId = res.locals.decrypt.userId;
                const result = yield (0, event_service_1.createEventServices)(Object.assign(Object.assign({}, req.body), { file: req.file, organizerId: userId, userId, role: "ORGANIZER" }));
                console.log("BODY:", req.body);
                console.log("FILE:", req.file);
                res.status(200).send({ success: true, result });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { category, title, location } = req.query;
            try {
                if (category &&
                    !Object.values(client_1.EventCategory).includes(category)) {
                    throw new AppError_1.default("Invalid event category", 400);
                }
                const result = yield (0, event_service_1.getAllEventsServices)({
                    category: category,
                    title: title,
                    location: location,
                });
                res.status(200).send({ success: true, result });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllByOrganizerId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = res.locals.decrypt.userId;
                if (!userId)
                    throw new AppError_1.default("User not found", 404);
                const result = yield (0, event_service_1.getAllEventByOrganizerServices)(userId);
                res.status(200).send({ success: true, result });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventId = Number(req.params.id);
                if (isNaN(eventId)) {
                    return next(new AppError_1.default("Invalid event ID", 400));
                }
                const result = yield (0, event_service_1.getEventByIdServices)(eventId);
                res.status(200).send({ success: true, result });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateEvent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventId = Number(req.params.id);
            if (isNaN(eventId)) {
                return next(new AppError_1.default("Invalid event ID", 400));
            }
            const { title, description, location, price, isPaid, startDate, endDate, seats, category, } = req.body;
            try {
                const userId = res.locals.decrypt.userId;
                const role = res.locals.decrypt.role;
                const updatedEvent = yield (0, event_service_1.updateEventServices)({
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
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteEvent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventId = Number(req.params.id);
            if (isNaN(eventId)) {
                return next(new AppError_1.default("Invalid event ID", 400));
            }
            try {
                const userId = res.locals.decrypt.userId;
                yield (0, event_service_1.deleteEventServices)(eventId, userId);
                res.status(200).send({ success: true, message: "Event deleted" });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = EventController;
