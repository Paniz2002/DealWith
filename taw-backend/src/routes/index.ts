import { Router } from "express";
import authRoutes from "./auth";
import commonRoutes from "./common";
import listingRoutes from "./listing";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/common", commonRoutes);
apiRouter.use("/listing", listingRoutes);
export default apiRouter;
