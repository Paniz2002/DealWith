import { Router } from "express";
import authRoutes from "./auth";
import commonRoutes from "./common";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/common", commonRoutes);
export default apiRouter;
