import { Router } from "express";
import { studentMiddleware } from "../middlewares/student";
import {
  getAuctionController,
  getAuctionDetailsController,
  newAuctionController,
  uploadAuctionImagesController,
  postAuctionBidController,
  getAuctionCommentsController,
  getAuctionImagesController,
  patchAuctionController,
  deleteAuctionController,
  postAuctionCommentsController,
  getMyParticipatedAuctionsController,
  getMyAuctionsController,
  getAuctionStatisticsController,
  deleteCommentController,
  editCommentController,
} from "../controllers/auction";
import upload from "../config/multer";
import { adminMiddleware } from "../middlewares/admin";
import authMiddleware from "../middlewares/auth";

const auctionRoutes: Router = Router();
auctionRoutes.post("/", [studentMiddleware], newAuctionController); // middleware per verificare che ci acceda solo uno studente
auctionRoutes.post(
  "/images",
  [upload.array("images", 5)],
  uploadAuctionImagesController,
);
auctionRoutes.get("/", getAuctionController);

auctionRoutes.get("/me", [studentMiddleware], getMyAuctionsController);
auctionRoutes.get(
  "/me/participated",
  [studentMiddleware],
  getMyParticipatedAuctionsController,
);

auctionRoutes.get(
  "/statistics",
  [adminMiddleware],
  getAuctionStatisticsController,
);

auctionRoutes.get("/:id/images", getAuctionImagesController);
auctionRoutes.get(
  "/:id/comments",
  [authMiddleware],
  getAuctionCommentsController,
);
auctionRoutes.post(
  "/:id/comments",
  [authMiddleware],
  postAuctionCommentsController,
);
auctionRoutes.get("/:id", getAuctionDetailsController);
auctionRoutes.post("/:id", [studentMiddleware], postAuctionBidController);
auctionRoutes.patch("/:id", patchAuctionController);
auctionRoutes.delete("/:id", [authMiddleware], deleteAuctionController);

auctionRoutes.delete(
  "/:id/comments/:idcomment",
  [authMiddleware],
  deleteCommentController,
);
auctionRoutes.put(
  "/:id/comments/:idcomment",
  [authMiddleware],
  editCommentController,
);
export default auctionRoutes;
