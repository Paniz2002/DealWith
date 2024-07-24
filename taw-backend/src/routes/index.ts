import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
export default apiRouter;
