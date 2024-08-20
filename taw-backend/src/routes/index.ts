import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import auctionRoutes from "./auction";
import bookRoutes from "./book";
import coursesRoutes from "./courses";
import notificationRoutes from "./notification";
const apiRouter: Router = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/auctions", auctionRoutes);
apiRouter.use("/books", bookRoutes);
apiRouter.use("/courses", coursesRoutes);
apiRouter.use("/notifications", notificationRoutes);
export default apiRouter;
