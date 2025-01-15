import Rating from '../models/ratingpost.model.js';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const createRating = async (req, res, next) => {
    try {
        const { userId, postId, rating } = req.body;

        // Check if the user has already rated this post
        const existingRating = await Rating.findOne({ userId, postId });
        if (existingRating) {
            return next(errorHandler(400, 'User has already rated this post'));
        }

        // Create new rating
        const newRating = new Rating({ userId, postId, rating });
        await newRating.save();

        // Update post's average rating
        const postRatings = await Rating.find({ postId });
        const totalRatings = postRatings.length;
        const totalRatingSum = postRatings.reduce((acc, curr) => acc + curr.rating, 0); //acc=0 curr: element current
        const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

        await Post.findByIdAndUpdate(postId, { rating: averageRating });

        // res.status(201).json({ message: "Rating created successfully" });
        res.json({ newRating: averageRating });
    } catch (error) {
        next(error);
    }
};


export const checkRating = async (req, res, next) => {
    try {
        const { userId, postId } = req.query;
        let hasRated = false;
        // Check if the user has already rated this post
        const rating = await Rating.findOne({ userId, postId });
        if (rating) {
            hasRated = true;
        }
        return res.status(200).json({ hasRated: hasRated });
    } catch (error) {
        next(error);
    }
};


export const getsuggestpostscbnf = async (req, res, next) => {
    try {
        const userId = req.query.userId;
        let posts;
        let allPostIds, allUserIds, curId;
        let arrUser = [];
        let arrAll = [];

        const allPost = await Post.find({ status: "approved" }, '_id');
        const allUser = await User.find({}, '_id');
        const ratingAll = await Rating.find();


        const ratingsAll = ratingAll.reduce((acc, curr) => {
            // Lấy ra thông tin cần thiết từ mỗi đánh giá và thêm vào mảng mới
            acc.push({
                userId: curr.userId,
                postId: curr.postId,
                rating: curr.rating
            });
            return acc;
        }, []);

        const ratingCurrUser = await Rating.find({ userId: userId });
        const ratingsUser = ratingCurrUser.reduce((acc, curr) => {
            // Lấy ra thông tin cần thiết từ mỗi đánh giá và thêm vào mảng mới
            acc.push({
                userId: curr.userId,
                postId: curr.postId,
                rating: curr.rating
            });
            return acc;
        }, []);

        if (allPost && allUser) {
            allPostIds = allPost.map(doc => doc._id.toString());
            allUserIds = allUser.map(doc => doc._id.toString());
        }

        //tạo mảng lưu trữ với giá trị null
        allUserIds.forEach(userId => {
            arrUser[userId] = [];
            allPostIds.forEach(postId => {
                arrUser[userId][postId] = null;

            });
        });

        allPostIds.forEach(postId => {
            arrAll[postId] = [];
            allUserIds.forEach(userId => {
                arrAll[postId][userId] = null;
            });
        });

        //tạo mảng arrUser và arrayAll
        ratingsAll.forEach(rating => {
            const postId = rating.postId;
            const userId = rating.userId;
            if (arrUser[userId] !== undefined) {

                if (arrUser[userId][postId] !== undefined) {
                    arrUser[userId][postId] = rating.rating;
                } else {
                    arrUser[userId][postId] = 0;
                }
            }
        });


        ratingsAll.forEach(rating => {
            const postId = rating.postId;
            const userId = rating.userId;
            if (arrAll[postId] !== undefined) {

                if (arrAll[postId][userId] !== undefined) {
                    arrAll[postId][userId] = rating.rating;
                }
            }
        });

        //Cập nhật lại phần tử bằng 0 nếu bài viết chưa có rating
        allUserIds.forEach(userId => {
            allPostIds.forEach(postId => {
                if (arrUser[userId] === undefined || arrUser[userId][postId] === null) {
                    arrUser[userId][postId] = 0;
                }
            });
        });

        allPostIds.forEach(postId => {
            allUserIds.forEach(userId => {
                if (arrAll[postId] === undefined || arrAll[postId][userId] === null) {
                    arrAll[postId][userId] = 0;
                }
            });
        });

        //Chuẩn hóa vector 
        const userArrayInit = arrUser;
        // Chuẩn bị dữ liệu
        const allUserListIds = Object.keys(arrUser);

        // Duyệt qua mỗi user
        allUserListIds.forEach(userId => {
            // Lấy vector của user hiện tại
            const userVector = arrUser[userId];

            // Tính tổng bình phương của các giá trị trong vector
            const sumOfSquares = Object.values(userVector).reduce((acc, rating) => acc + rating ** 2, 0);

            // Tính căn bậc hai của tổng bình phương
            const norm = Math.sqrt(sumOfSquares);

            if (norm === 0) {
                // Gán mỗi giá trị trong vector cho 0 
                for (const postId in userVector) {
                    if (userVector.hasOwnProperty(postId)) {
                        userVector[postId] = 0;
                    }
                }
            } else {
                // Chuẩn hóa vector
                for (const postId in userVector) {
                    if (userVector.hasOwnProperty(postId)) {
                        userVector[postId] /= norm;
                    }
                }
            }
            // Cập nhật lại vector sau khi chuẩn hóa
            arrUser[userId] = userVector;
        });


        //Lấy ra vector của user đang đăng nhập
        const userRecord = arrUser[userId];

        //Xác định ma trận giữa các user-user
        const dotProducts = [];

        allUserIds.forEach(otherUserId => {
            if (otherUserId !== userId) {
                const otherUserRecord = arrUser[otherUserId];
                let dotProduct = 0;

                // Tính tích vô hướng của userRecord và otherUserRecord
                allPostIds.forEach(postId => {
                    dotProduct += userRecord[postId] * otherUserRecord[postId];
                });
                dotProducts.push(dotProduct);
            }
            else {
                dotProducts.push(1);
            }
        });

        // Xác định độ quan tâm của 1user lên 1 item dựa trên các users gần nhau nhất(neighbor users)
        let targetArray = [...dotProducts];
        let sorted_list = dotProducts.sort(function (a, b) {
            return b - a;
        });
        let similarUserToUser = sorted_list[1];
        let indexUser = targetArray.indexOf(similarUserToUser);
        let similarUserId = allUserIds[indexUser];                // Lấy ra id userSimilar
        let vectorUserToUser = arrUser[similarUserId];            // Lấy ra vector rating của user-user đó

        //weight sum
        let weightSimilarUser = new Map();
        let sum = 0;
        allPostIds.forEach(postId => {
            sum += similarUserToUser * vectorUserToUser[postId];
            weightSimilarUser.set(postId, sum);
        });

        //Gợi ý ra các bài viết của userSimilar cho currentUser, mà currentUser này chưa rating, tức có trọng số là 0
        //--1. loại bỏ các bài viết mà curentUser đã rating

        const filteredWeightSimilarUser = new Map([...weightSimilarUser.entries()].filter(([postId, sum]) => !ratingsUser.some(rating => rating.postId === postId)));

        // Sắp xếp weightSimilarUser theo thứ tự giảm dần của value: sum
        const sortedWeightSimilarUser = new Map([...filteredWeightSimilarUser.entries()].sort((a, b) => b[1] - a[1]));

        // Lấy ra 3 key: postId có rating cao nhất
        const topThreePostIds = Array.from(sortedWeightSimilarUser.keys()).slice(0, 3);

        // Tìm các bài viết có _id nằm trong topThreePostIds
        const topThreePosts = await Post.find({ _id: { $in: topThreePostIds } });

        res.status(200).json({ topThreePosts });
    } catch (error) {
        next(error);
    }
};
