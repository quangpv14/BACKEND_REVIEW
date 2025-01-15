import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Rating from "../models/ratingpost.model.js";
import Notification from '../models/notification.model.js';
import { errorHandler } from "../utils/error.js";
import {
	incrementTotalCount,
	decrementTotalCount,
} from "../controllers/category.controller.js";

export const create = async (req, res, next) => {
	if (!req.body.title || !req.body.content) {
		return next(errorHandler(400, "Please provide all required fields"));
	}
	const slug = req.body.title
		.split(" ")
		.join("-")
		.toLowerCase()
		.replace(/[^a-zA-Z0-9-]/g, "");
	const newPost = new Post({
		...req.body,
		slug,
		userId: req.user.id,
	});
	try {
		const savedPost = await newPost.save();
		// Increment totalCount in the category
		await incrementTotalCount(req.body.category);

		res.status(201).json(savedPost);
	} catch (error) {
		next(error);
	}
};

export const getpostinfo = async (req, res, next) => {
	try {

		const posts = await Post.find({
			...(req.query.slug && { slug: req.query.slug }),
			...(req.query.postId && { _id: req.query.postId }),
		});

		res.status(200).json({
			success: true,
			message: "Post information",
			posts: posts,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Server error. Please try again.",
			error: err.message,
		});
	}
};

export const getposts = async (req, res, next) => {
	try {
		const startIndex = parseInt(req.query.startIndex) || 0;
		const limit = parseInt(req.query.limit) || 9;
		const sortDirection = req.query.order === "asc" ? 1 : -1;
		const posts = await Post.find({
			...(req.query.userId && { userId: req.query.userId }),
			...(req.query.category && { category: req.query.category }),
			...(req.query.slug && { slug: req.query.slug }),
			...(req.query.postId && { _id: req.query.postId }),
			...(req.query.searchTerm && {
				$or: [
					{ title: { $regex: req.query.searchTerm, $options: "i" } },
					{
						content: {
							$regex: req.query.searchTerm,
							$options: "i",
						},
					},
				],
			}),
			status: "approved",
		})
			.sort({ updatedAt: sortDirection })
			.skip(startIndex)
			.limit(limit);

		const totalPosts = await Post.countDocuments();

		const now = new Date();

		const oneMonthAgo = new Date(
			now.getFullYear(),
			now.getMonth() - 1,
			now.getDate()
		);

		const lastMonthPosts = await Post.countDocuments({
			createdAt: { $gte: oneMonthAgo },
		});

		res.status(200).json({
			posts,
			totalPosts,
			lastMonthPosts,
		});
	} catch (error) {
		next(error);
	}
};

export const deletepost = async (req, res, next) => {
	console.log(req.user.id !== req.params.userId);
	if (!req.user.isAdmin && req.user.id !== req.params.userId) {
		return next(
			errorHandler(403, "You are not allowed to delete this post")
		);
	}
	try {
		// Find the post by ID
		const post = await Post.findByIdAndDelete(req.params.postId);

		if (!post) {
			return next(errorHandler(404, "Post not found"));
		}
		// Decrement totalCount in the category
		await decrementTotalCount(post.category);

		res.status(200).json("The post has been deleted");
	} catch (error) {
		next(error);
	}
};

export const updatepost = async (req, res, next) => {
	// if (!req.user.isAdmin || req.user.id !== req.params.userId) {
	// 	return next(errorHandler(403, "You are not allowed to update this post"));
	// }
	try {
		const post = await Post.findById(req.params.postId);
		if (!post) {
			return next(errorHandler(404, "Post not found"));
		}

		let newStatus = post.status;
		if (post.status === 'rejected') {
			newStatus = 'pending';
		}

		const updatedPost = await Post.findByIdAndUpdate(
			req.params.postId,
			{
				$set: {
					title: req.body.title,
					content: req.body.content,
					category: req.body.category,
					image: req.body.image,
					status: newStatus,
				},
			},
			{ new: true }
		);
		res.status(200).json(updatedPost);
	} catch (error) {
		next(error);
	}
};

export const viewPost = async (req, res, next) => {
	try {
		const updatedPost = await Post.findById(req.params.postId);
		await Post.updateOne(
			{ _id: req.params.postId },
			{
				$set: {
					interaction: updatedPost.interaction
						? updatedPost.interaction + 1
						: 1,
				},
			}
		);
		res.status(200).json(updatedPost);
	} catch (error) {
		next(error);
	}
};

export const getallposts = async (req, res, next) => {
	try {
		const startIndex = parseInt(req.query.startIndex) || 0;
		const limit = parseInt(req.query.limit) || 9;

		// Fetch posts from the database 
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.skip(startIndex)
			.limit(limit)
			.populate("userId");

		// Send response with the fetched posts
		res.status(200).json({
			success: true,
			message: "A list of all posts",
			posts: posts,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Server error. Please try again.",
			error: err.message,
		});
	}
};

export async function getallpostsbyuserid(req, res, next) {
	const userId = req.params.userId;

	try {
		const posts = await Post.find({ userId: userId })
			.sort({ createdAt: -1 })
			.exec();
		res.status(200).json({
			success: true,
			message: `Posts by user ${userId}`,
			posts: posts,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Server error. Please try again.",
			error: err.message,
		});
	}
}

export const searchPosts = async (req, res, next) => {
	try {
		const searchtext = req.query.searchtext;
		const query = {};

		if (searchtext) {
			query.$or = [
				{ title: { $regex: searchtext, $options: "i" } },
				{ category: { $regex: searchtext, $options: "i" } },
			];
		}

		const posts = await Post.find(query).populate('userId', 'username fullname email');
		res.status(200).json(posts);
	} catch (error) {
		next(error);
	}
};

//get limit post by status
export const getpostsbystatus = async (req, res, next) => {
	try {
		const startIndex = parseInt(req.query.startIndex) || 0;
		const limit = parseInt(req.query.limit) || 9;
		const status = req.query.status;

		const posts = await Post.find({ status: status })
			.sort({ createdAt: -1 })
			.skip(startIndex)
			.limit(limit)
			.populate("userId");

		// Send response with the fetched posts
		res.status(200).json({
			success: true,
			message: "A list of all posts",
			posts: posts,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Server error. Please try again.",
			error: err.message,
		});
	}
};

export const filterPostByStatus = async (req, res, next) => {
	try {
		const status = req.query.status;
		const categoryName = req.query.categoryName;
		const posts = await Post.find({
			...(categoryName && { category: categoryName }),
			...(status && { status: status }),
		})
			.sort({ createdAt: -1 })
			.populate("userId");

		// Send response with the fetched posts
		res.status(200).json({
			success: true,
			message: "A list of posts",
			posts: posts,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Server error. Please try again.",
			error: err.message,
		});
	}
};


export const searchPostsByStatus = async (req, res, next) => {
	try {
		const searchtext = req.query.searchtext;
		const status = req.query.status;
		const query = { status };

		if (searchtext) {
			query.$or = [
				{ title: { $regex: searchtext, $options: "i" } },
				{ category: { $regex: searchtext, $options: "i" } },
			];
		}
		const posts = await Post.find(query).populate('userId', 'username fullname email');;
		res.status(200).json(posts);
	} catch (error) {
		next(error);
	}
};


export const approvepost = async (req, res, next) => {
	if (!req.user.isAdmin) {
		return next(
			errorHandler(403, "You are not allowed to approve this post")
		);
	}
	const { slug, status, reason } = req.body;

	try {

		const post = await Post.findOneAndUpdate({ slug }, { status }, { new: true });

		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}

		let content;
		if (status === 'rejected') {
			content = reason;
		} else if (status === 'approved') {
			content = `Bài viết "${post.title}" đã được phê duyệt thành công!`;
		}

		const notification = new Notification({
			content, // Ghi lý do từ chối
			userId: post.userId, // Assumed field for the post's author
			postId: post._id,
		});

		await notification.save();

		res.status(200).json({ status: post.status });
	} catch (error) {
		next(error);
	}
};

//get recent post

export const getsuggestposts = async (req, res, next) => {
	try {
		const sortDirection = req.query.order === "asc" ? 1 : -1;
		const userId = req.query.userId;
		const postSlug = req.query.postSlug;


		//lấy ra bài viết hiện tại
		const currentPost = await Post.find({ slug: postSlug });
		const currentPostId = currentPost[0]._id;

		//1. Get post recent
		// Lấy danh sách các bài viết mà user đã rating
		const ratedPostIds = await Rating.find({ userId: userId }).select('postId');

		// Nếu postId hiện tại không nằm trong danh sách các bài viết đã rating thì thêm vào chuỗi
		if (currentPost && !ratedPostIds.includes(currentPostId)) {
			ratedPostIds.push(currentPostId);
		}

		//const ratedPostIdList = ratedPostIds.map((rating) => rating.postId.toString());
		const recentposts = await Post.find({
			_id: { $nin: ratedPostIds },
			status: "approved",
		})
			.sort({ updatedAt: sortDirection })
			.limit(3);


		//2. Get 2 bài viết có rating cao nhất trong cùng category của bài post hiện tại
		const topRatedPosts = await Post.find({
			category: currentPost[0].category,
			_id: { $ne: currentPostId.toString() },
			status: "approved",
		})
			.sort({ rating: -1 })
			.limit(2);


		//3. Get ra các 6 category khác category của bài viết hiện tại có total rating cao

		const categoryRatings = await Post.aggregate([
			{
				$match: { status: "approved" } // condition: status: "approved"
			},
			{
				$group: {
					_id: "$category",
					totalRating: { $sum: "$rating" }
				}
			},
			{
				$sort: { totalRating: -1 } // Giảm dần
			}
		]);
		// Loại trừ category của bài viết hiện tại khỏi danh sách
		const filteredCategories = categoryRatings.filter(category => category._id !== currentPost.category);
		// Lấy ra 6 category khác nhau có tổng số lượt đánh giá cao nhất
		const topRatedCategories = filteredCategories.slice(0, 6);

		//4. Get ra top 10 bài viết có rating cao nhất theo theo tuần
		const now = new Date();
		const oneWeekAgo = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() - 7
		);

		const topSixPosts = await Post.find({
			createdAt: { $gte: oneWeekAgo },
			status: "approved",
		})
			.sort({ rating: -1 })
			.limit(6);


		res.status(200).json({
			recentposts,
			topRatedPosts,
			topRatedCategories,
			topSixPosts
		});
	} catch (error) {
		next(error);
	}
};
