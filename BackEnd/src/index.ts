import "dotenv/config";
import express from "express";
import cors from "cors" ;
import {getEnv} from "./lib/env" ;
import {clerkMiddleware}from "@clerk/express";
import { clerkWebHookHandler } from "./webhooks/clerk";
import fs from "fs"
import path from "path"

const envVariables = getEnv() ;
const PORT = envVariables.PORT  ;
const app = express ();
const rawJson = express.raw({type : "application/json" , limit : "1mb"}) ;
app.post("/webhooks/clerk" , rawJson,(req, res)=>{
    void clerkWebHookHandler(req , res ) ;
})

app.use(express.json())
app.use(express.urlencoded());
// app.use(cors());

app.use(clerkMiddleware());

const publicDir = path.join(__dirname , "../public");
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))
    app.get("/{*any}",(req ,res , next ) =>{
    if(req.method !=="GET" && req.method !== "HEAD" ){
        return next();
    }
    if(req.path.startsWith("/api") || req.path.startsWith("/webhooks")){
        return next()
    }
    res.sendFile(path.join(publicDir , "index.html") , (err)=>next(err))
})
}

app.listen(PORT , ()=> console.log("the app is running on port " , PORT));

