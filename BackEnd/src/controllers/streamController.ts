import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import  getUserByClerkId  from "../lib/getUserByClerkId";
import { getStreamChatServer, streamChatDisplayName, getStreamUserId} from "../lib/stream.js";
import { getEnv } from "../lib/env.js";
import { UserRole } from "../db/schema";
type user = {role : UserRole , displayName : string , email : string}
const env = getEnv();

export async function createStreamToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const localUser : user = await getUserByClerkId(userId);
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }

    const server = getStreamChatServer();

    const clerkUser = await clerkClient.users.getUser(userId);


    const name = streamChatDisplayName(
      localUser.role,
      localUser.displayName,
      localUser.email,
    );

    const image = clerkUser.imageUrl || undefined;
    const sid = getStreamUserId(userId);

    await server.upsertUser({ id: sid, name, image });

    const token = server.createToken(sid);

    res.json({ token, apiKey: env.STREAM_API_KEY, userId: sid, name });
  } catch (e) {
    next(e);
  }
}