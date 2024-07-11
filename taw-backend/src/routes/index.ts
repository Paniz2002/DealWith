import { Router } from "express";
import authRoutes from "./auth";
import cashierRoutes from "./admin";
import checkAuthenticationMiddleware from "../middlewares/auth";
// import commonRoutes from "./common";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
export default apiRouter;
