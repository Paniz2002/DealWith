import { Router } from "express";
import { loginController } from "../controllers/login";
import { registerController } from "../controllers/register";
import { errorHandler } from "../error-handler";
import authMiddleware from "../middlewares/auth";
import { loggedUserController } from "../controllers/logged-user";
const authRoutes: Router = Router();

authRoutes.post("/login", errorHandler(loginController));
authRoutes.post("/register", errorHandler(registerController));
authRoutes.get("/me", [authMiddleware], errorHandler(loggedUserController));

export default authRoutes;
