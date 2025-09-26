import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const yesterday = new Date(Date.now() - 86400000);

    const n8nRes = await fetch(
      "https://andrew-wk.tailffd0d.ts.net/webhook/news",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          date: yesterday.toISOString(),
        }),
      }
    );

    if (!n8nRes.ok)
      throw new Error(`n8n returned status ${n8nRes.status}`);

    const n8nData = await n8nRes.json();
    return NextResponse.json({ ok: true, data: n8nData });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
