import { NextFunction, Request, Response } from "express";
import {
  createVoucherServices,
  getVoucherByEventIdServices,
} from "../services/voucher.service";
import AppError from "../errors/AppError";

class VoucherController {
  public getVoucherByEventId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const eventId = Number(req.params.eventId);
      if (isNaN(eventId)) {
        throw new AppError("Invalid event ID", 400);
      }
      const result = await getVoucherByEventIdServices(eventId);

      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  };

  public createVoucher = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { eventId, discount, code, startDate, endDate } = req.body;
      const userId = res.locals.decrypt.userId;

      const result = await createVoucherServices({
        eventId,
        discount,
        code,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  };
}

export default VoucherController;
