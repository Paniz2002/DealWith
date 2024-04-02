import { Router } from "express";
import authRoutes from "./auth";
import cashierRoutes from "./cashier";
import authMiddleware from "../middlewares/auth";
import commonRoutes from "./common";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/cashier", authMiddleware, cashierRoutes);
apiRouter.use("/common", authMiddleware, commonRoutes);
export default apiRouter;
