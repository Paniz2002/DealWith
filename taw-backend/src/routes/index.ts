import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import listingRoutes from "./listing";
import bookRoutes from "./book";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/listings", listingRoutes);
apiRouter.use("/books", bookRoutes);
export default apiRouter;
