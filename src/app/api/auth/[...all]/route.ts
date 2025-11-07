import { auth } from "@/lib/auth";

import { toNextJsHandler } from "better-auth/next-js";

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Auth route moved" }, { status: 404 });
}

export function POST() {
  return NextResponse.json({ error: "Auth route moved" }, { status: 404 });
}