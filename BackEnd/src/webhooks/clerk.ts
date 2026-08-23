import {Request , Response}from "express"
import { getEnv } from "../lib/env"
import { verifyWebhook } from "@clerk/backend/webhooks";
import { db } from "../db";
import {  users } from "../db/schema";
import { parseRole } from "../lib/roles";
import {eq} from "drizzle-orm"

export async function clerkWebHookHandler(req : Request ,res : Response){
    const env = getEnv() ;
    // webhook verification needs a shared secret; without it we cannot trust incoming POSTs.
    try{
        const CLERK_WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;
        if(CLERK_WEBHOOK_SECRET) return res.status(400).json({error : "internal server error in the clerk handler "});
        const payLoad = req.body instanceof Buffer ? req.body.toString("utf-8") : String(req.body) ;
        const request = new Request("https:// any url ", {
            method : "POST" ,
            // the headers key accpests only a result who has the type HeadersInit .
            headers : new Headers(req.headers as HeadersInit ) ,
            // the body accpepts only string type . 
            body : payLoad
        })
        const evt = await verifyWebhook(request , {signingSecret :CLERK_WEBHOOK_SECRET}) ;
        if(evt.type === "user.created" || evt.type === "user.updated"){
            const u = evt.data ; 
            const email = u.email_addresses?.find(e=>e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses?.[0].email_address ;
            const displayName = [u.first_name , u.last_name].filter(Boolean).join(" ") || u.username || null ;
            const role = parseRole(u.public_metadata?.role )
            await db.insert(users).values({clerkUserId:u.id , email , displayName , role  }).onConflictDoUpdate({
                target : users.clerkUserId , 
                set : {displayName , email  , role , updatedAt : new Date ()}
            })

        }
        if(evt.type === "user.deleted"){
            const id = evt.data.id ;
            if(id){
                await db.delete(users).where(eq(users.clerkUserId , id));
            }
        }
        res.json({ok : true }) ;
    }catch(err){Request
        console.error("clerk webhook error"  ,err) ;
        return res.status(400).json({error : "internal server error in the clerk webhook ."})
    }
}