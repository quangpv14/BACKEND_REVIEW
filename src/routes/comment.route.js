import express from "express";
import {
	verifyToken,
	verifyIsAdminOrNonBlockedUser,
} from "../utils/verifyUser.js";
import {
	createComment,
	deleteComment,
	editComment,
	getPostComments,
	getcomments,
	likeComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post(
	"/create",
	verifyToken,
	verifyIsAdminOrNonBlockedUser,
	createComment
);
router.get("/getPostComments/:postId", getPostComments);
router.put("/likeComment/:commentId", verifyToken, likeComment);
router.put(
	"/editComment/:commentId",
	verifyToken,
	verifyIsAdminOrNonBlockedUser,
	editComment
);
router.delete(
	"/deleteComment/:commentId",
	verifyToken,
	verifyIsAdminOrNonBlockedUser,
	deleteComment
);
router.get("/getcomments", verifyToken, getcomments);

export default router;
