import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const content = messages[0].content
    const image = messages[0].image
    const lang = messages[0].lang

    const n8nRes = await fetch(
      "https://andrew-wk.tailffd0d.ts.net/webhook/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          image,
          lang
        }),
      }
    );

    if (!n8nRes.ok)
      throw new Error(`n8n returned status ${n8nRes.status}`);
  

    const n8nData = await n8nRes.json()
    console.log(n8nData)
    return NextResponse.json({ data: n8nData });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
