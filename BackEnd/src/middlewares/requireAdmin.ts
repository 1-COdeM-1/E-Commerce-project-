import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import getUserByClerkId from "../lib/getUserByClerkId";
import { isAdmin } from "../lib/roles";

export default async function requireAdmin(req : Request , res : Response , next : NextFunction){
    try{
        const {userId , isAuthenticated } = getAuth(req)
        if(!userId || !isAuthenticated) return res.status(401).json({error : "the user is not authonticated yet . "}) ;
        const localUser = await getUserByClerkId(userId) ;
        const roleOk = isAdmin(localUser.role) ;
        if(!roleOk) return res.status(403).json({error : "admins only "})
    }catch(e){
        next(e) ;
    }
}