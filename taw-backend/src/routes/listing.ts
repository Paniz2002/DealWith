import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import { newListingController } from "../controllers/listing/new-listing";

// students only
const listingRoutes: Router = Router();
listingRoutes.post("/", [studentMiddleware], newListingController); // middleware per verificare che ci acceda solo uno studente
export default listingRoutes;