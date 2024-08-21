import {Router} from "express";
import {
    deleteNotificationController,
    getNotificationsController,
    setNotificationReadController
} from "../controllers/notification";

const notificationRoutes: Router = Router();
notificationRoutes.get("/", getNotificationsController);
notificationRoutes.patch("/:id", setNotificationReadController);
notificationRoutes.delete("/:id", deleteNotificationController);
export default notificationRoutes;