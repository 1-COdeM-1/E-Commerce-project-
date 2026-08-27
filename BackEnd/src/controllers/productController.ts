import { and, eq,desc} from "drizzle-orm";
import { NextFunction ,Request , Response } from "express";
import { products } from "../db/schema";
import { db } from "../db";

const listProducts = async(req : Request , res : Response , next : NextFunction )=>{
    try{
        const cat = typeof req.query.category === "string" ? req.query.category :"";
        const activeOnly = eq(products.active , true );
        const whereClause = cat ? and(activeOnly , eq(products.category , cat)) : activeOnly ;
        const rows = await db.select().from(products).where(whereClause).orderBy(desc(products.createdAt)); ;
        res.json({products : rows}) ;
    }catch (e){
        next(e)
    }
}
const getCategories = async( res : Response , next : NextFunction )=>{
    try{
        const activeOnly = eq(products.active , true );
        const result = await db.select({category:products.category}).from(products).where(activeOnly) ;
        const categories = [...new Set(result.map(r=>r.category).sort((a , b)=>a.localeCompare(b)))]
        res.json({categories}) ;
    }catch (e){
        next(e)
    }
}
const getProductBySlug = async(req : Request , res : Response , next : NextFunction )=>{
    try{
        const slug = typeof req.params.slug === "string" ? req.params.slug : "" ;
        const activeOnly = eq(products.active , true );
        const whereClause = and(activeOnly ,eq(products.slug , slug))
        const [row] = await db.select().from(products).where(whereClause).limit(1) ;
        if(!row) return res.status(404).json({error : "the product not found"}) ;
        res.json({product : row} ) ;
    }catch (e){
        next(e)
    }
}
export {listProducts , getCategories , getProductBySlug} ;