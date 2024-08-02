import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import { getBooksController, postBookController } from "../controllers/book";

// students only
const bookRoutes: Router = Router();
bookRoutes.get("/", [studentMiddleware], getBooksController); // get all books or filter by string q
bookRoutes.post("/", [studentMiddleware], postBookController);
// bookRoutes.get("/:id", [studentMiddleware] , searchBooks); // get book by id
export default bookRoutes;
