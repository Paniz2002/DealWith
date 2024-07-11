import { Router } from "express";
import { loginController } from "../controllers/login";
import { registerController } from "../controllers/register";
import { updateProfileController } from "../controllers/profile";
import checkAuthenticationMiddleware from "../middlewares/auth";
import { profileController } from "../controllers/logged-user";
const authRoutes: Router = Router();

authRoutes.post("/login", loginController);
authRoutes.post("/register", registerController);
authRoutes.get("/me", checkAuthenticationMiddleware, profileController);
authRoutes.patch("/me", checkAuthenticationMiddleware, updateProfileController);
export default authRoutes;
