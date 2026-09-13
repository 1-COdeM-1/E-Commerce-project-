import { useAuth } from "@clerk/react"
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";


export  const useOrdersPage = ()=>{
    const {getToken , isSignedIn} = useAuth() ;
    const {data : ordersData  , isLoading , error } = useQuery({
        queryKey : ["orders"] ,
        queryFn : ()=>apiFetch("/api/orders" , {getToken}),
        enabled : isSignedIn 
    })
    const {data : meData } = useQuery({
        queryKey : ["meData"] , 
        queryFn : ()=>apiFetch("api/me" , {getToken}) ,
        enabled : isSignedIn 
    })
    const staff = meData?.user?.role === "admin" || meData?.user?.role === "support" ;
    const orders = ordersData?.orders ?? [] ;
    return{
        orders , 
        staff , 
        isLoading , 
        error
    }

}