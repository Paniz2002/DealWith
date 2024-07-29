import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import { getBooksController } from "../controllers/book";

// students only
const bookRoutes: Router = Router();
bookRoutes.get("/", [studentMiddleware], getBooksController); // get all books or filter by string q
export default bookRoutes;
