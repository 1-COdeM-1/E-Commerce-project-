import "dotenv/config";
import express from "express";
import {getEnv} from "./lib/env" ;
import {clerkMiddleware}from "@clerk/express";
import { clerkWebHookHandler } from "./webhooks/clerk";
import fs from "fs"
import path from "path"
import cornJop from "./lib/cron" ;
import cors from "cors" ;
import meRouter from "./routes/meRouter" ;
import productRouter from "./routes/productRouter" ;
import streamRouter from "./routes/streamRouter";
import checkoutRouter from "./routes/checkoutRouter"
import {polarWebhookHandler} from "./webhooks/polar" ;
const envVariables = getEnv() ;
const PORT = envVariables.PORT  ;
const app = express ();
const rawJson = express.raw({type : "application/json" , limit : "1mb"}) ;
app.post("/webhooks/clerk" , rawJson,(req, res)=>{
    void clerkWebHookHandler(req , res ) ;
})
app.post("/webhooks/polar" , rawJson,(req, res)=>{
    void polarWebhookHandler(req , res ) ;
})
app.use(express.json())
app.use(express.urlencoded());
app.use(cors());

app.use(clerkMiddleware());
app.use("api/me" , meRouter) ;
app.use("api/products" , productRouter) ;
app.use("api/stream" ,streamRouter) ;
app.use("api/checkout" , checkoutRouter) ;
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

app.listen(PORT , ()=> {
    console.log("the app is running on port " , PORT)
    if(envVariables.NODE_ENV === "production"){
        cornJop.start();
    }
});

