import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Helper to fetch user by email
async function getUserByEmail(client: MongoClient, email: string) {
  const db = client.db();
  return db.collection("users").findOne({ email });
}

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const client = await clientPromise;
        const user = await getUserByEmail(client, credentials.email);
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user._id.toString(), email: user.email, name: user.name || null, image: user.image || null } as any;
      },
    }),
  ],
  pages: {},
});

export { handler as GET, handler as POST };
