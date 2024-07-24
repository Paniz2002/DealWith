import { Router } from "express";
import {
  getStudentsController,
  deleteStudentsController,
} from "../controllers/common/students";
import { adminMiddleware } from "../middlewares/admin";
const adminRoutes: Router = Router();
adminRoutes.get("/students", adminMiddleware, getStudentsController);
adminRoutes.delete("/students", adminMiddleware, deleteStudentsController);
export default adminRoutes;
