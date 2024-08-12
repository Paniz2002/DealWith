import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import {
  getAuctionController,
  getAuctionDetailsController,
  newAuctionController,
  uploadAuctionImagesController,
  postAuctionBidController,
  getAuctionCommentsController,
} from "../controllers/auction";
import upload from "../config/multer";
import authMiddleware from "../middlewares/auth";

// students only
const auctionRoutes: Router = Router();
auctionRoutes.post("/", [studentMiddleware], newAuctionController); // middleware per verificare che ci acceda solo uno studente
auctionRoutes.post(
  "/images",
  [studentMiddleware, upload.array("images", 5)],
  uploadAuctionImagesController,
);
auctionRoutes.get("/", getAuctionController);
auctionRoutes.get("/:id", getAuctionDetailsController);
auctionRoutes.post("/:id", postAuctionBidController);
auctionRoutes.get("/comments", [authMiddleware], getAuctionCommentsController);
export default auctionRoutes;
