import { Router } from "express";
import { adminController } from "../controllers/admin";
import { tableController } from "../controllers/commmon/table";
const cashierRoutes: Router = Router();

cashierRoutes.get("/admin", adminController);
cashierRoutes.post("/admin", adminController);
cashierRoutes.delete("/admin", adminController);
export default cashierRoutes;
