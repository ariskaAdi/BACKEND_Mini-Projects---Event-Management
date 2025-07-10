export interface GetAllTransactionsPayload {
  status?: string;
  userId: number;
  role: string;
}

export interface CreateTransactionInput {
  userId: number;
  eventId: number;
  quantity: number;
  totalPaid: number;
}
