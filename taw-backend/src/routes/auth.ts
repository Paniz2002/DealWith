import { Router } from "express";
import { login } from "../controllers/auth";
import { register } from "../controllers/register";
const authRoutes: Router = Router();

authRoutes.get("/login", login);
authRoutes.post("/register", register);
export default authRoutes;
