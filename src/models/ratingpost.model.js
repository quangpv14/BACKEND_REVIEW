import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            ref: 'User',
            required: true,
        },
        postId: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true }
);

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;