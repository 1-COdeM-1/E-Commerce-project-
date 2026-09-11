import { useAuth } from "@clerk/react";
import {useCart} from "../store/cart"
import { useQuery } from "@tanstack/react-query";
import {apiFetch}from "../lib/api"
import { useState } from "react";
export default function useCartPage(){
    const {getToken} = useAuth() ;
    const [checkoutLoading, setCheckoutLoading] = useState(false) ;
    const items = useCart((s) => s.items);
    const setQty = useCart((s) => s.setQty);
    const removeItem = useCart((s) => s.removeItem);
    const {data : productsData , isLoading: productsLoading,isError: productsError} = useQuery({
        queryKey : ["products"] , 
        queryFn : ()=>apiFetch("/api/products") , 
        enabled : items.length > 0
    })
    const products = productsData?.products ??[]
    const byId = new Map(products.map(p=>[p.id,p]));
    const lines = items.map((line)=>({line , product: byId.get(line.productId) ?? null})) ;
    let subTotal = lines.reduce((sum , line)=>{
        if(!line.product) return sum 
        return sum + line.line.quantity * line.product.priceCents
    } , 0)
    async function checkout(){
        setCheckoutLoading(true)
        const body ={
            items : items.map((item)=>({productId : item.productId , quantity : item.quantity}))
        }
        const checkOutData = await apiFetch("/api/checkout" , {getToken , body , method : "post"}) 
        if (checkOutData?.checkoutUrl) {
        window.location.href = checkOutData.checkoutUrl;
        return;
        }

        setCheckoutLoading(false);
  }
  return{
    items,
    setQty,
    removeItem,
    productsLoading,
    productsError,
    lines,
    subtotal: subTotal,
    checkout,
    checkoutLoading
  }
}

