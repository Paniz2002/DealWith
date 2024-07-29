import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import listingRoutes from "./listing";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/listing", listingRoutes);
export default apiRouter;
