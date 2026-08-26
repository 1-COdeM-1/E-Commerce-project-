import { getAuth } from "@clerk/express";
import express from "express" ;
import getUserByClerkId from "../lib/getUserByClerkId";

const router = express.Router() ;
router.get("/" , async (req , res , next )=>{
try{
    const { userId, isAuthenticated } = getAuth(req); 
    if(!userId || !isAuthenticated) return res.status(401).json({error : "the user isnot authorized yet ."});
    const user = await getUserByClerkId( userId) ; 
    if(!user) return res.status(500).json({error : "internal server error while getting the user by clerkid which is already exist in the clerk app ."});
    res.json({user}) ;
}catch(e){
    next(e) ;
}
})
export default router ;