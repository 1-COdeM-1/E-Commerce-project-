import {z} from "zod" ;
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),

  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  FRONT_END_URL: z.string().url(),

  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_API_BASE: z.string().url().default("https://api.polar.sh").optional(),//delete optional

  POLAR_CHECKOUT_PRODUCT_ID: z.string().optional(),//delete optional and add uuid()

  STREAM_API_KEY: z.string().min(1),
  STREAM_API_SECRET: z.string().min(1),

  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),

  SENTRY_DSN: z.string().url().optional()
})

export type ENV = z.infer<typeof envSchema> ;

export function loadEnv(){
    const result = envSchema.safeParse(process.env)
    if(!result.success){
        console.error (result.error.flatten().fieldErrors)
        throw new Error ("invalid environment variables ")
    }
    return result.data ;
}
let cachedEnv : ENV | null = null 
export function getEnv (){
    if(!cachedEnv) {
        cachedEnv = loadEnv()
    }
    return cachedEnv ;
}