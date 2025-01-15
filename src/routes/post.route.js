import express from "express";
import {
	verifyToken,
	verifyIsAdminOrNonBlockedUser,
} from "../utils/verifyUser.js";
import {
	create,
	deletepost,
	getposts,
	getpostsbystatus,
	updatepost,
	getallposts,
	getallpostsbyuserid,
	searchPosts,
	searchPostsByStatus,
	viewPost,
	getpostinfo,
	approvepost,
	filterPostByStatus,
	getsuggestposts,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create", verifyToken, verifyIsAdminOrNonBlockedUser, create);
router.get("/getposts", getposts);
router.get("/getallposts", verifyToken, getallposts);
router.delete(
	"/deletepost/:postId/:userId",
	verifyToken,
	verifyIsAdminOrNonBlockedUser,
	deletepost
);
router.put(
	"/updatepost/:postId/:userId",
	verifyToken,
	verifyIsAdminOrNonBlockedUser,
	updatepost
);
router.put("/approvepost/update", verifyToken, approvepost);
router.put("/viewpost/:postId/:userId", verifyToken, viewPost);
router.get("/user/:userId", getallpostsbyuserid);
router.get("/filterposts/search", searchPosts);
router.get("/getpostsbystatus", verifyToken, getpostsbystatus);
router.get("/filterpostsbystatus/search", searchPostsByStatus);
router.get("/getpost/info", getpostinfo);
router.get("/getpost/all/filters", verifyToken, filterPostByStatus);
router.get("/getpost/review/rating/suggest", verifyToken, getsuggestposts);
export default router;
