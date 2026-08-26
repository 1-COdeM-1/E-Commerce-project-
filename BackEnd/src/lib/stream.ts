import { UserRole } from "../db/schema";
import { getEnv } from "./env";
import { StreamChat } from "stream-chat";
const env = getEnv()
export function streamChatDisplayName(role : UserRole , displayName : string | null, email : string) :string{
    const base = displayName ? displayName : email ;
    if(role === "admin") return `admin . ${base}` ;
    if(role === "support") return `support . ${base}` ;
    return base ;
};
export function getStreamChatServer(){
    return StreamChat.getInstance(env.STREAM_API_KEY , env.STREAM_API_SECRET ) ;
} ;

export function getStreamUserId (clerkUserId : string){
    return `clerk _ ${clerkUserId}` ;
};