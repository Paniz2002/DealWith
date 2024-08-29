import { Router } from "express";
import { loginController } from "../controllers/login";
import { registerController } from "../controllers/register";
import { updateProfileController } from "../controllers/profile";
import authMiddleware from "../middlewares/auth";
import { profileController } from "../controllers/logged-user";
import { logoutController } from "../controllers/logout";
const authRoutes: Router = Router();

authRoutes.post("/login", loginController);
authRoutes.post("/register", registerController);
authRoutes.post("/logout", logoutController);
authRoutes.get("/me", [authMiddleware], profileController);
authRoutes.patch(
  "/me",
  [authMiddleware],
  updateProfileController,
);
export default authRoutes;
