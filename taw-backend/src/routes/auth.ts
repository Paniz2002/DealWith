import { Router } from "express";
import { loginController } from "../controllers/login";
import { registerController } from "../controllers/register";
import authMiddleware from "../middlewares/auth";
import { loggedUserController } from "../controllers/logged-user";
const authRoutes: Router = Router();

authRoutes.post("/login", loginController);
authRoutes.post("/register", registerController);
authRoutes.get("/me", authMiddleware, loggedUserController);

export default authRoutes;
