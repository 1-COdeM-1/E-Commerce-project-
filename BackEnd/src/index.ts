import express from "express";
import path from "path" ;
import dotenv from "dotenv" ;
const app = express ()
const envPath = path.join(__dirname ,".." , ".env" );
dotenv.config({path : envPath}) ;
const PORT = process.env.PORT || 3001

app.listen(PORT , ()=> console.log("the app is running on port " , PORT));

