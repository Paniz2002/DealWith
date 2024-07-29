import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import { getBooks } from "../controllers/book";

// students only
const bookRoutes: Router = Router();
bookRoutes.get("/book", [studentMiddleware] , getBooks); // get all books or filter by string q
export default bookRoutes;