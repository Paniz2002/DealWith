import { Router } from "express";
import {
  getCoursesController,
  postCoursesController,
} from "../controllers/courses";
const coursesRoutes: Router = Router();
coursesRoutes.get("/", [], getCoursesController);
coursesRoutes.post("/", [], postCoursesController);
export default coursesRoutes;
