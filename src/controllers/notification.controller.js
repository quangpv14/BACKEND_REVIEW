import { errorHandler } from '../utils/error.js';
import Notification from '../models/notification.model.js';

export const createNotification = async (req, res, next) => {
    try {
        const { content, userId, postId } = req.body;

        // Create new rating
        const newNotify = new Notification({ content, userId, postId });
        await newNotify.save();

        res.status(201).json(newNotify);
    } catch (error) {
        next(error);
    }
}

export const getCountNotify = async (req, res, next) => {
    const userId = req.query.userId;

    try {
        // Tìm tất cả thông báo chưa đọc (status: false) của người dùng
        const unreadNotifications = await Notification.find({
            userId: userId,
            status: false,
        });

        res.status(200).json({ notify: unreadNotifications.length });
    } catch (error) {
        next(error);
    }
};

export const getAllNotify = async (req, res, next) => {
    const userId = req.params.userId;  // Lấy userId từ tham số route

    try {
        // Lấy tất cả thông báo của người dùng
        const notifications = await Notification.find({ userId });

        if (!notifications || notifications.length === 0) {
            return;
        }

        // Cập nhật tất cả thông báo có status = false thành true
        const updatedNotifications = await Notification.updateMany(
            { userId, status: false },  // Điều kiện lọc thông báo chưa đọc
            { $set: { status: true } }  // Cập nhật trạng thái thành true
        );

        // Sau khi cập nhật trạng thái, lấy lại danh sách thông báo
        const updatedNotificationsList = await Notification.find({ userId });

        res.status(200).json({ notify: updatedNotificationsList });
    } catch (error) {
        next(error);
    }
};
