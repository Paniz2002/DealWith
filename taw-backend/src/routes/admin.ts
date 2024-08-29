import { Router } from "express";
import {
  getStudentsController,
  deleteStudentsController,
} from "../controllers/admin/students";
import {
  getUniversitiesController,
  postUniversitiesController,
} from "../controllers/admin/university";
import { postCoursesController } from "../controllers/admin/course";

import { getCitiesController } from "../controllers/admin/city";
import { adminMiddleware } from "../middlewares/admin";
const adminRoutes: Router = Router();
adminRoutes.get("/students", adminMiddleware, getStudentsController);
adminRoutes.delete("/students", adminMiddleware, deleteStudentsController);
adminRoutes.get("/universities", adminMiddleware, getUniversitiesController);
adminRoutes.post("/universities", adminMiddleware, postUniversitiesController);
adminRoutes.post("/courses", adminMiddleware, postCoursesController);
adminRoutes.get("/cities", adminMiddleware, getCitiesController);
export default adminRoutes;
