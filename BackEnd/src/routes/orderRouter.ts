import express from "express";
const router = express.Router() ;
import {createStreamChannel, createVideoInvite, getOrder, orderController} from "../controllers/orderController" ;
router.get("/" , orderController ) ;
router.get("/:id" , getOrder) ;
router.get("/:id/stream-channel" , createStreamChannel) ;
router.get("/:id/video-invite" , createVideoInvite)

export default router ;