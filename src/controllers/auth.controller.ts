import { NextFunction, Request, Response } from "express";
import { loginService, registerService } from "../services/auth.service";

class AuthController {
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await registerService(req.body);
      res.status(201).send({ message: "User registered", success: true });
    } catch (error) {
      next(error);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, user } = await loginService(req.body);
      res.status(200).send({
        message: "User logged in",
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.clearCookie("token");
      res.status(200).send({ message: "User logged out", success: true });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
