import { Router } from "express";
import { GET_STUDENTS_CONTROLLER } from "../controllers/common/student";
import { adminMiddleware } from "../middlewares/admin";
const commonRoutes: Router = Router();
commonRoutes.get("/students", adminMiddleware, GET_STUDENTS_CONTROLLER);
export default commonRoutes;
