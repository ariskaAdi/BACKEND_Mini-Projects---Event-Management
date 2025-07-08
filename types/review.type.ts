export interface CreateReviewPayload {
  userId: number;
  eventId: number;
  rating: number;
  comment: string;
}
