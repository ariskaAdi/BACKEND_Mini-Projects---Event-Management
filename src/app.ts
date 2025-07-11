import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import AuthRouter from "./routes/auth.router";
import UserRouter from "./routes/user.router";
import EventRouter from "./routes/event.router";
import logger from "./utils/logger";
import TransactionRouter from "./routes/transaction.router";
import ReviewRouter from "./routes/review.router";
import VoucherRouter from "./routes/voucher.router";

const PORT: string | number = process.env.PORT || 4000;

class App {
  public app: Application;
  constructor() {
    this.app = express();
    this.configure();
    this.route();
    this.errorHandler();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private route(): void {
    const authRouter = new AuthRouter();
    const userRouter = new UserRouter();
    const eventRouter = new EventRouter();
    const transactionRouter = new TransactionRouter();
    const reviewRouter = new ReviewRouter();
    const voucherRouter = new VoucherRouter();
    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).send("<h1>Welcome to the API</h1>");
    });
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/user", userRouter.getRouter());
    this.app.use("/event", eventRouter.getRouter());
    this.app.use("/transaction", transactionRouter.getRouter());
    this.app.use("/review", reviewRouter.getRouter());
    this.app.use("/voucher", voucherRouter.getRouter());
  }

  private errorHandler(): void {
    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        logger.error(
          `${req.method} ${req.path} ${error.message} ${JSON.stringify(error)}`
        );
        res.status(error.rc || 500).send(error);
      }
    );
  }
  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  }
}

export default App;
