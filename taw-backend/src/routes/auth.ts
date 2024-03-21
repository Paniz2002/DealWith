import { Router } from "express";
import { loginController } from "../controllers/login";
import { registerController } from "../controllers/register";
import { errorHandler } from "../error-handler";
const authRoutes: Router = Router();


authRoutes.post("/login", errorHandler(loginController) );
authRoutes.post("/register", errorHandler(registerController) );

export default authRoutes;
