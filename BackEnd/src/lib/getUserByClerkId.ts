import {users} from "../db/schema" ;
import {eq}from "drizzle-orm" ;
import {db} from "../db/index" ;
import { Response } from "express";
export default async function getUserByClerkId (res:Response,clerkId : string){
    try{
        const [row] = await db.select().from(users).where(eq(users.clerkUserId , clerkId)).limit(1) ;
        return row ;
    }catch(e){
        console.error(e) ;
        return res.status(500).json({error : "internal server error while getting the local user by clerId"})
    }
}