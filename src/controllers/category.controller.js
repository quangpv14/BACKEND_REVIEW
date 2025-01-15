import Category from '../models/category.model.js';
import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

// Create a new category
export const createCategory = async (req, res, next) => {
    const { categoryName, description, status } = req.body;
    try {
        // Check category exists
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return next(errorHandler(400, 'Category name already exists'));
        }

        const category = new Category({ categoryName, description, status });

        await category.save();
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        next(error);
    }
};

// Update an existing category
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { categoryName, description, status } = req.body;

        // Find the current category
        const currentCategory = await Category.findById(id);
        if (!currentCategory) {
            return next(errorHandler(404, 'Category not found'));
        }

        // If the categoryName updated, update all related posts
        if (categoryName && categoryName !== currentCategory.categoryName) {
            await Post.updateMany(
                { categoryName: currentCategory.categoryName },
                { categoryName }
            );
        }

        // Update the category
        const category = await Category.findByIdAndUpdate(
            id,
            { categoryName, description, status },
            { new: true }
        );

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        next(error);
    }
};

// Delete an existing category
export const deleteCategory = async (req, res, next) => {
    if (!req.user.isAdmin || req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'You are not allowed to delete this category'));
    }

    try {
        const { id } = req.params;

        // Find the category by ID and delete it
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return next(errorHandler(404, 'Category not found'));
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Increment totalCount when a new post is created
export const incrementTotalCount = async (categoryName) => {
    try {
        const category = await Category.findOneAndUpdate(
            { categoryName },
            { $inc: { totalCount: 1 } },
            { new: true }
        );

        if (!category) {
            return next(errorHandler(400, 'Category not found'));
        }

        return category;
    } catch (error) {
        throw error;
    }
};

// Decrement totalCount when a post is deleted
export const decrementTotalCount = async (categoryName) => {
    try {
        const category = await Category.findOneAndUpdate(
            { categoryName },
            { $inc: { totalCount: -1 } },
            { new: true }
        );

        if (!category) {
            throw new Error('Category not found');
        }

        return category;
    } catch (error) {
        throw error;
    }
};

export function getallcategory(req, res, next) {
    try {
        Category.find()
            .sort({ createdAt: -1 })
            .then(allCategory => {
                return res.status(200).json({
                    success: true,
                    message: "A list of all categories",
                    categories: allCategory
                });
            })
            .catch(err => {
                res.status(500).json({
                    success: false,
                    message: "Server error. Please try again.",
                    error: err.message
                });
            });
    } catch (err) {
        next(err);
    }
};

export const searchCategory = async (req, res, next) => {
    try {
        const searchtext = req.query.searchtext;
        const query = {};

        if (searchtext) {
            query.$or = [
                { categoryName: { $regex: searchtext, $options: 'i' } },
                { description: { $regex: searchtext, $options: 'i' } },
            ];
        }

        const posts = await Category.find(query);
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};