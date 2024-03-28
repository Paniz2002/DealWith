import { Router } from "express";
import authRoutes from "./auth";
import cashierRoutes from "./cashier";
import authMiddleware from "../middlewares/auth";

const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/cashier", authMiddleware, cashierRoutes);
export default apiRouter;
