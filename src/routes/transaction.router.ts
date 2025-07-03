import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";

class TransactionRouter {
  private route: Router;
  private transactionController: TransactionController;

  constructor() {
    this.route = Router();
    this.transactionController = new TransactionController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get("/", this.transactionController.getAll);
    this.route.get("/:id", this.transactionController.getById);
    this.route.post("/", this.transactionController.createTransaction);
    this.route.patch(
      "/:id",
      this.transactionController.updateTransactionForUser
    );
    this.route.patch(
      "/admin/:id",
      this.transactionController.updateTransactionForAdmin
    );
    this.route.delete("/:id", this.transactionController.deleteTransaction);
  }
  public getRouter(): Router {
    return this.route;
  }
}

export default TransactionRouter;
