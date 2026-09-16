import express from "express";
const router = express.Router() ;
import {createStreamChannel, createVideoInvite, getOrder, orderController} from "../controllers/orderController" ;
router.get("/" , orderController ) ;
router.get("/:id" , getOrder) ;
router.post("/:id/stream-channel" , createStreamChannel) ;
router.post("/:id/video-invite" , createVideoInvite)

export default router ;