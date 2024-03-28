import { Router } from "express";
import { adminController } from "../controllers/admin";
const cashierRoutes: Router = Router();

cashierRoutes.post("/admin", adminController);
cashierRoutes.delete("/admin", adminController);
export default cashierRoutes;
