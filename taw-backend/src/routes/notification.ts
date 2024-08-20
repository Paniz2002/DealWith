import {Router} from "express";
import {getNotificationsController} from "../controllers/notification";

const notificationRoutes: Router = Router();
notificationRoutes.get("/", getNotificationsController);
export default notificationRoutes;