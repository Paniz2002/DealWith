import { Router } from "express";
import { login as loginController } from "../controllers/auth";
import { registerController } from "../controllers/register";
const authRoutes: Router = Router();


authRoutes.get("/login", loginController);
authRoutes.post("/register", registerController);
export default authRoutes;
