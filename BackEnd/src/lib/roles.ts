
import {UserRole} from "../db/schema" ;
let VALID_ROLES  = ["customer" , "admin" , "support"] 
export function parseRole(value : unknown):UserRole{
    if(typeof value !=="string"){
        return "customer"
    }
    if(!VALID_ROLES.includes(value)) return "customer"; 
    return value as UserRole;
}
export function isAdmin(role : UserRole){
    return role === "admin" ;
}
export function isStaff(role : UserRole ){
    return role === "support" || role === "admin";
}