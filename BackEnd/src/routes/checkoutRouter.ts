
import express from "express";
import checkoutController from "../controllers/checkoutController";
const router = express.Router() ;
router.post("/" , checkoutController )

export default router ;