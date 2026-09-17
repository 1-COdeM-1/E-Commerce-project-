import express from "express";
import requireAdmin from "../middlewares/requireAdmin";
import { createAdminProduct, deleteAdminProduct, getImageKitAuth, listAdminProducts, updateAdminProduct } from "../controllers/adminController";
import { getCategories } from "../controllers/productController";
const router = express.Router() ;
router.use(requireAdmin) ;
router.get("/imagekit/auth" , getImageKitAuth) ;
router.get("/products" , listAdminProducts) ;
router.get("/products/categories" , getCategories)
router.post("/products", createAdminProduct) ;
router.post("/products/:id", updateAdminProduct) ;
router.delete("/products/:id", deleteAdminProduct);
export default router ;