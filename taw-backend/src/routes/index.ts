import { Router } from "express";
import authRoutes from "./auth";
import commonRoutes from "./common";
import listingRoutes from "./listing";
import bookRoutes from "./book";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/common", commonRoutes);
apiRouter.use("/listing", listingRoutes);
apiRouter.use("/", bookRoutes);
export default apiRouter;
