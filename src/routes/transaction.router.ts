import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { verifyToken } from "../middleware/verifyToken";
import { uploaderMemory } from "../middleware/uploader";

class TransactionRouter {
  private route: Router;
  private transactionController: TransactionController;

  constructor() {
    this.route = Router();
    this.transactionController = new TransactionController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get("/", verifyToken, this.transactionController.getAll);
    this.route.get("/:id", verifyToken, this.transactionController.getById);
    this.route.post(
      "/",
      verifyToken,
      this.transactionController.createdTransaction
    );
    this.route.patch(
      "/:id",
      verifyToken,
      uploaderMemory().single("paymentProof"),
      this.transactionController.updateTransactionForUser
    );
    this.route.patch(
      "/admin/:id",
      verifyToken,
      this.transactionController.updateTransactionForAdmin
    );
  }
  public getRouter(): Router {
    return this.route;
  }
}

export default TransactionRouter;
