import { Router } from "express";
import { tableController } from "../controllers/commmon/table";
const commonRoutes: Router = Router();

commonRoutes.get("/table", tableController);

export default commonRoutes;
