import mongoose from 'mongoose';

const notifySchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        postId: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: false,
        },

    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notifySchema);

export default Notification;


