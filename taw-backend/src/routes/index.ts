import { Router } from "express";
import authRoutes from "./auth";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
export default apiRouter;
