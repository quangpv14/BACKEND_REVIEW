import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            //enum: ['active', 'inactive'],
            required: true,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;

