import { Router } from "express";
import cashierRoutes from "./cashier";
const homepageRouter: Router = Router();

homepageRouter.use("/cashier", cashierRoutes);

export default homepageRouter;
