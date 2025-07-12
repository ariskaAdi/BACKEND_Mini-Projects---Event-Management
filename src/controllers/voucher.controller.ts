import { NextFunction, Request, Response } from "express";
import {
  createVoucherServices,
  getAllvoucherServices,
  getVoucherByEventIdServices,
} from "../services/voucher.service";
import AppError from "../errors/AppError";

class VoucherController {
  public getAllVoucher = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await getAllvoucherServices();

      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  };

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
      const {
        eventId,
        discount,
        code,
        startDate,
        endDate,
        quota,
        discountType,
      } = req.body;
      if (!eventId || !discount || !code || !startDate || !endDate || !quota) {
        throw new AppError("Missing required fields", 400);
      }
      const userId = res.locals.decrypt.userId;

      const result = await createVoucherServices({
        eventId: Number(eventId),
        discount: Number(discount),
        code: String(code),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        quota: Number(quota),
        discountType,
      });
      res.status(200).send({ success: true, result });
    } catch (error) {
      next(error);
    }
  };
}

export default VoucherController;
