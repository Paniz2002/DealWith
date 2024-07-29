import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import auctionRoutes from "./auction";
import bookRoutes from "./book";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/auctions", auctionRoutes);
apiRouter.use("/books", bookRoutes);
export default apiRouter;
