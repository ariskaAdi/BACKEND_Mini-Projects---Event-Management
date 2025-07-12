import { Router } from "express";
import VoucherController from "../controllers/voucher.controller";
import { verifyToken } from "../middleware/verifyToken";
import { onlyOrganizer } from "../middleware/by-role/organizerMiddleware";

class VoucherRouter {
  private route: Router;
  private voucherController: VoucherController;

  constructor() {
    this.route = Router();
    this.voucherController = new VoucherController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get("/", this.voucherController.getAllVoucher);
    this.route.get("/:eventId", this.voucherController.getVoucherByEventId);
    this.route.post(
      "/",
      verifyToken,
      onlyOrganizer,
      this.voucherController.createVoucher
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default VoucherRouter;
