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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.createEvent = exports.updateEventById = exports.findEventById = exports.findAllEventsByOrganizerId = exports.findAllEvents = void 0;
const prisma_1 = require("../config/prisma");
const eventWithOrganizerSelect = {
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
    organizerId: true,
};
const findAllEvents = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, title, location } = filters;
    const containsInsensitive = (value) => ({
        contains: value,
        mode: "insensitive",
    });
    return yield prisma_1.prisma.event.findMany({
        where: {
            category: category ? category : undefined,
            title: title ? containsInsensitive(title) : undefined,
            location: location ? containsInsensitive(location) : undefined,
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
});
exports.findAllEvents = findAllEvents;
const findAllEventsByOrganizerId = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.event.findMany({
        where: {
            organizerId,
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
});
exports.findAllEventsByOrganizerId = findAllEventsByOrganizerId;
const findEventById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.prisma.event.findUnique({
        where: {
            id,
        },
        select: eventWithOrganizerSelect,
    });
    return event;
});
exports.findEventById = findEventById;
const updateEventById = (eventId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.event.update({
        where: { id: eventId },
        data,
    });
});
exports.updateEventById = updateEventById;
const createEvent = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.event.create({
        data,
    });
});
exports.createEvent = createEvent;
const deleteEvent = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.event.delete({
        where: { id: eventId },
    });
});
exports.deleteEvent = deleteEvent;
