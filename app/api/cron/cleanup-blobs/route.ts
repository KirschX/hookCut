import { list, del } from "@vercel/blob";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Blob storage not configured" },
      { status: 503 },
    );
  }

  const cutoff = Date.now() - TTL_MS;
  const toDelete: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "cuts/", cursor });
    for (const blob of page.blobs) {
      const uploaded = blob.uploadedAt
        ? new Date(blob.uploadedAt).getTime()
        : 0;
      if (uploaded > 0 && uploaded < cutoff) toDelete.push(blob.url);
    }
    cursor = page.cursor;
  } while (cursor);

  if (toDelete.length > 0) await del(toDelete);
  return Response.json({ deleted: toDelete.length });
}
