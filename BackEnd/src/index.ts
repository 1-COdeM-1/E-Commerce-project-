import "dotenv/config";
import express from "express";
import cors from "cors" ;
import {getEnv} from "./lib/env" ;
import {clerkMiddleware}from "@clerk/express";
import { clerkWebHookHandler } from "./webhooks/clerk";
const envVariables = getEnv() ;
const PORT = envVariables.PORT  ;
const app = express ();
const rawJson = express.raw({type : "application/json" , limit : "1mb"}) ;
app.post("/webhooks/clerk" , rawJson,(req, res)=>{
    void clerkWebHookHandler(req , res ) ;
})

app.use(express.json())
app.use(express.urlencoded());
app.use(cors());

app.use(clerkMiddleware());




app.listen(PORT , ()=> console.log("the app is running on port " , PORT));

