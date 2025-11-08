import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET() {
  try {
    const db = await getDb();
    // ping the server
    const admin = db.admin();
    const ping = await admin.ping();

    return NextResponse.json({ ok: true, db: db.databaseName, ping });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Mongo error' }, { status: 500 });
  }
}
