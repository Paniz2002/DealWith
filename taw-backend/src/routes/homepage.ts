import { Router } from "express";

const homepageRouter: Router = Router();

homepageRouter.use("/cashier", cashierRoutes);

export default homepageRouter;
