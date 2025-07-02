import { Router } from "express";
import UserController from "../controllers/user.controller";
import { verifyToken } from "../middleware/verifyToken";

class UserRouter {
  private route: Router;
  private userController: UserController;

  constructor() {
    this.route = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get("/profile/:id", this.userController.getProfile);
    this.route.patch("/profile/:id", this.userController.updateProfile);
    this.route.patch(
      "/change-password/:id",
      this.userController.changePassword
    );
    this.route.put("/upgrade-role/:id", this.userController.upgradeToOrganizer);
    this.route.get("/profile/get/me", verifyToken, this.userController.getMe);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default UserRouter;
