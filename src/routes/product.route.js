import express from "express";
import {
    verifyToken,
    verifyIsAdminOrNonBlockedUser,
} from "../utils/verifyUser.js";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByCategory,
    getProductById,
    getInitProducts,
    getSearchProducts,
    getRelatedDeviceByProduct,
    getAllProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/create", createProduct);

router.delete(
    "/deleteproduct/:productId/:userId",
    verifyToken,
    deleteProduct
);
router.put(
    "/updatepost/:postId/:userId",
    verifyToken,
    verifyIsAdminOrNonBlockedUser,
    updateProduct
);

router.get("/getallproducts", getAllProducts);
router.get("/getproductsbycategory", getProductByCategory);
router.get("/getrelatedevicebycategory", getRelatedDeviceByProduct);
router.get("/getproductsbyid", getProductById);
router.get("/getinitproducts", getInitProducts);
router.get("/search", getSearchProducts);


export default router;
