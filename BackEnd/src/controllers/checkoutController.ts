import { getAuth } from "@clerk/express";
import { NextFunction ,Request , Response } from "express";
import z from "zod" ;
import { getEnv } from "../lib/env";
import getUserByClerkId from "../lib/getUserByClerkId";
import { db } from "../db";
import { CheckoutSessionLine, checkoutSessions, products } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { polarCreateCheckout } from "../lib/polar";

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});
const env = getEnv()
export default async function checkoutController(req : Request , res : Response , next : NextFunction){
try{
    const {userId , isAuthenticated} = getAuth(req) ;
    if(!userId||!isAuthenticated) return res.status(401).json({error : "the user isnot authorized ."}) ;
    const parsed = cartSchema.safeParse(req.body) ;
    if(!parsed.success) return res.status(400).json({ error: "Invalid cart", details: parsed.error.flatten() }); 
    if(!env.POLAR_ACCESS_TOKEN)return res.status(503).json({error : "internal server error the access token isnot found in the environment . "}) ; 
    const localUser = getUserByClerkId(userId) ;
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }
    const ids = parsed.data.items.map(i=>i.productId) ; 
    const prodRows = await db.select().from(products).where(and(inArray(products.id , ids) , eq(products.active , true))) ;
    if(prodRows.length !== ids.length) return res.status(400).json({error : "One or more products are invalid"}) ;

    const byId = new Map(prodRows.map((p)=>[p.id , p])) ;
    let lines : CheckoutSessionLine[] = [] ;
    let totalCents = 0
    for(const line of parsed.data.items){
        const p = byId.get(line.productId)! ;
        totalCents += p.priceCents * line.quantity ;
        lines.push({
            productId : p.id ,
            unitPriceCents : p.priceCents ,
            quantity : line.quantity 
        })
    if (totalCents < 10) {
      res.status(400).json({
        error: "Total below Polar minimum (e.g. USD requires at least 10 cents)",
      });
        return;
    }
    const [session] = await db.insert(checkoutSessions).values({
        userId : userId , 
        lines , 
        totalCents ,
        currency : "egb" 
    }).returning();
    const successUrl = `${env.FRONT_END_URL}/checkout/return?checkout_id={CHECKOUT_ID}`;
    const returnUrl = `${env.FRONT_END_URL}/cart`;
    const checkout = await polarCreateCheckout(env, {
      products: [env.POLAR_CHECKOUT_PRODUCT_ID],
      prices: {
        [env.POLAR_CHECKOUT_PRODUCT_ID]: [
          {
            amount_type: "fixed",
            price_currency: "egb",
            price_amount: totalCents
          },
        ],
      },

      success_url: successUrl,
      return_url: returnUrl,
      external_customer_id: userId,
      metadata: { checkout_session_id: session.id },
    });
    await db.update(checkoutSessions).set({polarCheckoutId : checkout.id}).where(eq(checkoutSessions.id , session.id)) ;
    res.json({checkoutUrl: checkout.url}) ;
    }
}catch(e){
    next(e) ;
} 
}