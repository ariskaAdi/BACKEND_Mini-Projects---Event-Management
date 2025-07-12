import { DiscountType } from "../../prisma/generated/client";

export interface IVoucher {
  eventId: number;
  code: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  quota: number;
  discountType?: DiscountType;
}
