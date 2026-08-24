import {CronJob} from "cron" ;

import https from "node:https" ;
import http from "node:http" ;
import { getEnv } from "./env";

const job = new CronJob("*/14 * * * *" , function (){
    const env = getEnv() ;
    if(!env.FRONT_END_URL)return ;
    const base = env.FRONT_END_URL ;
    const url = new URL("/health" , base).href ;
    const client = url.startsWith("https") ? https : http ;
    client.get(url ,(res)=>{
        if(res.statusCode === 200) console.log("GET request sent successfully");
        else console.log("GET request failed", res.statusCode);
    }).on("error" , (e) => console.error("Error while sending request", e))
})
export default job ;