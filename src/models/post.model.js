import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			ref: 'User',
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
			unique: true,
		},
		image: {
			type: String,
			default:
				"https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
		},
		category: {
			type: String,
			default: "uncategorized",
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		status: {
			type: String,
			default: "pending",
		},
		interaction: {
			type: Number,
			default: 0,
		},
		message: {
			type: String,
			default: "",
		},
		rating: {
			type: Number,
			default: 0,
		},

	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
