
import express from "express";
import checkoutController from "../controllers/checkoutController";
const router = express.Router() ;
router.get("/" , checkoutController )

export default router ;