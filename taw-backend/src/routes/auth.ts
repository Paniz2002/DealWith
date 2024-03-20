import { Router } from "express";
import { loginController } from "../controllers/login";
import { registerController } from "../controllers/register";
const authRoutes: Router = Router();


authRoutes.post("/login", loginController);
authRoutes.post("/register", registerController);

export default authRoutes;
