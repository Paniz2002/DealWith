import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import {
  getAuctionController,
  getAuctionDetailsController,
  newAuctionController,
  uploadAuctionImagesController,
  postAuctionBidController,
} from "../controllers/auction";
import upload from "../config/multer";

// students only
const auctionRoutes: Router = Router();
auctionRoutes.post("/", [studentMiddleware], newAuctionController); // middleware per verificare che ci acceda solo uno studente
auctionRoutes.post(
  "/images",
  [studentMiddleware, upload.array("images", 5)],
  uploadAuctionImagesController,
); // middleware per verificare che ci acceda solo uno studente
auctionRoutes.get("/", getAuctionController);
auctionRoutes.get("/:id", getAuctionDetailsController);
auctionRoutes.post("/:id", postAuctionBidController);
export default auctionRoutes;
