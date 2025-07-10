"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const user_router_1 = __importDefault(require("./routes/user.router"));
const event_router_1 = __importDefault(require("./routes/event.router"));
const logger_1 = __importDefault(require("./utils/logger"));
const transaction_router_1 = __importDefault(require("./routes/transaction.router"));
const review_router_1 = __importDefault(require("./routes/review.router"));
const PORT = process.env.PORT || 4000;
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.route();
        this.errorHandler();
    }
    configure() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    route() {
        const authRouter = new auth_router_1.default();
        const userRouter = new user_router_1.default();
        const eventRouter = new event_router_1.default();
        const transactionRouter = new transaction_router_1.default();
        const reviewRouter = new review_router_1.default();
        this.app.get("/", (req, res) => {
            res.status(200).send("<h1>Welcome to the API</h1>");
        });
        this.app.use("/auth", authRouter.getRouter());
        this.app.use("/user", userRouter.getRouter());
        this.app.use("/event", eventRouter.getRouter());
        this.app.use("/transaction", transactionRouter.getRouter());
        this.app.use("/review", reviewRouter.getRouter());
    }
    errorHandler() {
        this.app.use((error, req, res, next) => {
            logger_1.default.error(`${req.method} ${req.path} ${error.message} ${JSON.stringify(error)}`);
            res.status(error.rc || 500).send(error);
        });
    }
    start() {
        this.app.listen(PORT, () => {
            console.log(`Server started at http://localhost:${PORT}`);
        });
    }
}
exports.default = App;
