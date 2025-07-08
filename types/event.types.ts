export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  price: number | string;
  isPaid: boolean | string;
  startDate: string;
  endDate: string;
  seats: number | string;
  category: string;
  organizerId: number | string;
  file?: Express.Multer.File;
  userId: number;
  role: string;
}

export interface GetAllEventFilter {
  category?: string;
  title?: string;
  location?: string;
}

export interface UpdateEventData {
  eventId: number;
  title: string;
  description: string;
  location: string;
  price: number | string;
  isPaid: boolean | string;
  startDate: string;
  endDate: string;
  seats: number | string;
  category: string;
  file?: Express.Multer.File;
  userId: number;
  role: string;
}
