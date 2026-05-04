import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(503).json({ error: "OPENAI_API_KEY is not configured" });
    return;
  }

  try {
    const bodyStr =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});

    const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: bodyStr,
    });

    const buf = await upstream.arrayBuffer();
    const ct = upstream.headers.get("content-type") || "audio/mpeg";
    res.status(upstream.status).setHeader("Content-Type", ct);
    res.send(Buffer.from(buf));
  } catch (e) {
    console.error("audio-speech proxy:", e);
    res.status(502).json({ error: "Upstream proxy failed" });
  }
}
