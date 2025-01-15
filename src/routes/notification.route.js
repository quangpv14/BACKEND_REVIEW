import express from "express";
import {
    verifyToken,
    verifyIsAdminOrNonBlockedUser,
} from "../utils/verifyUser.js";

import {
    getCountNotify,
    getAllNotify,
} from "../controllers/notification.controller.js";

const router = express.Router();
router.get("/getcountnotify", verifyToken, getCountNotify);
router.get("/update/:userId", verifyToken, getAllNotify);

export default router;