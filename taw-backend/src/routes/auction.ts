import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import { newAuctionController } from "../controllers/auction";

// students only
const auctionRoutes: Router = Router();
auctionRoutes.post("/", [studentMiddleware], newAuctionController); // middleware per verificare che ci acceda solo uno studente
export default auctionRoutes;