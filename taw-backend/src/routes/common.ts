import { Router } from "express";
import { GET_STUDENTS_CONTROLLER } from "../controllers/common/student";
const commonRoutes: Router = Router();
commonRoutes.get("/students", GET_STUDENTS_CONTROLLER);
export default commonRoutes;
