import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers";
import { getDb, getMongoClient } from "@/lib/mongo";

// Initialize Better Auth with MongoDB adapter
export const auth = betterAuth({
  database: mongodbAdapter(await getDb(), {
    client: await getMongoClient(),
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}