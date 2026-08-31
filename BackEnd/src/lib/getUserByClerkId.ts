import {UserRole, users} from "../db/schema" ;
import {eq }from "drizzle-orm" ;
import {db} from "../db/index" ;
type user = {role : UserRole , displayName : string , email : string , id : string}
export default async function getUserByClerkId (clerkId : string) {
    
        const [row] = await db.select().from(users).where(eq(users.clerkUserId , clerkId)).limit(1) ;
        return row as user;
    
}