import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import { getBooksController } from "../controllers/book";

// students only
const bookRoutes: Router = Router();
bookRoutes.get("/", [studentMiddleware], getBooksController); // get all books or filter by string q
// bookRoutes.get("/:id", [studentMiddleware] , searchBooks); // get book by id
export default bookRoutes;
