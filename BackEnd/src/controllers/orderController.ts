import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import getUserByClerkId from "../lib/getUserByClerkId";
import { isStaff } from "../lib/roles";
import { db } from "../db";
import { orderItems, orders, products, users } from "../db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getStreamChatServer, getStreamUserId, streamChatDisplayName } from "../lib/stream";
import { getEnv } from "../lib/env";
const env = getEnv()
export async function orderController(req : Request , res  : Response, next : NextFunction ){
    try{
        const {userId , isAuthenticated } = getAuth(req)
        if(!userId || !isAuthenticated) return res.sendStatus(403) ;
        const localUser = await getUserByClerkId(userId) ;
        if(!localUser) return res.status(503).json({error : "the account not synced yet ."}) ;
        const rows = isStaff(localUser.role) ? await db.select().from(orders).orderBy(desc(orders.createdAt)) 
            : await db.select().from(orders).where(eq(orders.userId , userId)).orderBy(desc(orders.createdAt)) ;
        const orderIds = rows.map(e =>e.id) ;
        const previewByOrder = new Map() ;
        if(orderIds.length > 0) {
            const itemRows = await db.select({orderId : orderItems.orderId , quantity : orderItems.quantity , name : products.name , slug : products.slug , imageUrl : products.imageUrl}).from(orderItems).innerJoin(products , eq(orderItems.productId , products.id)).where(inArray(orderItems.orderId , orderIds)).orderBy(desc(orderItems.productId)) ;
            for(const row of itemRows){
                const list = previewByOrder.get(row.orderId) ?? [] ;
                list.push({
                    name : row.name , 
                    slug : row.slug ,
                    imageUrl : row.imageUrl , 
                    quantity : row.quantity 
                });
                previewByOrder.set(row.orderId , list) ;
            }
        }
        const ordersPayload = rows.map((o)=>({
            ...o , 
            previewItems : previewByOrder.get(o.polarOrderId) ?? []
        }));
        res.json({ orders: ordersPayload });
    }catch(e){
        next (e)
    }
}
export const getOrder = async(req : Request , res  : Response, next : NextFunction)=>{
    try{
        const {userId , isAuthenticated } = getAuth(req) ;
        if(!userId || !isAuthenticated) return res.sendStatus(403) ;
        const localUser = await getUserByClerkId(userId) ;
        if(!localUser) return res.status(503).json({error : "the account not synced yet ."}) ;
        const id = req.params.id ; 
        if(!id) return res.status(400).json({error : "there is no id in the params ."}) ;
        const [order] = isStaff(localUser.role) ?await db.select().from(orders).where(eq(orders.id , id as string)) 
            : await db.select().from(orders).where(and(eq(orders.id , id as string) , eq(orders.userId , localUser.id))) ;
        if(!order) return res.status(404).json({error : "there is no order with this id ."}) ;
        const items = await db
            .select({
                itemId: orderItems.id,
                quantity: orderItems.quantity,
                unitPriceCents: orderItems.unitPriceCents,
                product: products,
            })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id));
        const theOrder = {
            ...order , 
            items
        }
        res.json({order : theOrder}) ;
    }catch(e){
        next(e);
    }
}
export async function createStreamChannel(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const server = getStreamChatServer();

    const localUser = await getUserByClerkId(userId);
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);

    if (!order) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const isOwner = order.userId === localUser.id;
    if (!isOwner && !isStaff(localUser.role)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    if (order.status !== "paid") {
      res.status(403).json({ error: "Order must be paid to open support chat" });
      return;
    }

    const streamChatUserId = getStreamUserId(userId);

    await server.upsertUser({
      id: streamChatUserId,
      name: streamChatDisplayName(localUser.role, localUser.displayName, localUser.email),
    });

    const channelId = `order-${order.id}`;
    const channel = server.channel("messaging", channelId, {
      created_by_id: streamChatUserId
    });

    await channel.create();

    await channel.addMembers([streamChatUserId]);

    res.json({ channelType: "messaging", channelId, streamUserId: streamChatUserId });
  } catch (e) {
    next(e);
  }
}

export const createVideoInvite = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const server = getStreamChatServer();

    const localUser = await getUserByClerkId(userId);
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }

    if (!isStaff(localUser.role)) {
      res.status(403).json({ error: "Only support or admin can send a video invite" });
      return;
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);

    if (!order || order.status !== "paid") {
      res.status(404).json({ error: "Order not found or not paid" });
      return;
    }

    const [owner] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);

    const customerSid = getStreamUserId(owner.clerkUserId);
    await server.upsertUser({
      id: customerSid,
      name: owner.displayName ?? owner.email ?? "Customer",
    });

    const staffStreamUserId = getStreamUserId(userId);
    await server.upsertUser({
      id: staffStreamUserId,
      name: streamChatDisplayName(localUser.role, localUser.displayName, localUser.email),
    });

    const channelId = `order-${order.id}`;
    const channel = server.channel("messaging", channelId, {
      created_by_id: customerSid
    });

    await channel.create();
    await channel.addMembers([customerSid, staffStreamUserId]);

    const joinUrl = `${env.FRONT_END_URL.replace(/\/+$/, "")}/orders/${order.id}/call`;

    await channel.sendMessage({
        text: `Video call — tap Join below (same link for everyone): ${joinUrl}`,
        user_id: staffStreamUserId,
        video_invite: true,
        join_url: joinUrl,
    } as any);

    res.json({ ok: true, joinUrl });
    } catch (e) {
        next(e);
    }
}