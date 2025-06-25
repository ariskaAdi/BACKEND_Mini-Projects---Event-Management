import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import AuthRouter from "./routes/auth.router";
import UserRouter from "./routes/user.router";
import EventRouter from "./routes/event.router";

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
    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).send("<h1>Welcome to the API</h1>");
    });
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/user", userRouter.getRouter());
    this.app.use("/event", eventRouter.getRouter());
  }

  private errorHandler(): void {
    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
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
