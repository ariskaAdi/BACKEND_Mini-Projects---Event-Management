import { EventCategory } from "../../prisma/generated/client";
import { prisma } from "../config/prisma";

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

export const findAllEvents = async (filters: {
  category?: string;
  title?: string;
  location?: string;
}) => {
  const { category, title, location } = filters;

  const containsInsensitive = (value: string) => ({
    contains: value,
    mode: "insensitive" as const,
  });

  return await prisma.event.findMany({
    where: {
      category: category ? (category as EventCategory) : undefined,
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
};

export const findAllEventsByOrganizerId = async (organizerId: number) => {
  return await prisma.event.findMany({
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
};

export const findEventById = async (id: number) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    select: eventWithOrganizerSelect,
  });
  return event;
};

export const updateEventById = async (
  eventId: number,
  data: {
    title: string;
    description: string;
    location: string;
    price: number;
    isPaid: boolean;
    startDate: Date;
    endDate: Date;
    seats: number;
    picture: string | null;
    category: EventCategory;
  }
) => {
  return await prisma.event.update({
    where: { id: eventId },
    data,
  });
};

export const createEvent = async (data: {
  title: string;
  description: string;
  location: string;
  price: number;
  isPaid: boolean;
  startDate: Date;
  endDate: Date;
  organizerId: number;
  seats: number;
  picture: string;
  category: EventCategory;
}) => {
  return await prisma.event.create({
    data,
  });
};

export const deleteEvent = async (eventId: number) => {
  return await prisma.event.delete({
    where: { id: eventId },
  });
};
