import { kvAvailable, getKv } from "@/lib/kv";
import { WizardSnapshotSchema } from "@/schemas/wizard";

export const runtime = "edge";

const KEY = (id: string) => `wizard:${id}`;
const TTL = 60 * 60 * 24; // 24h

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!kvAvailable) {
    return new Response(null, { status: 404 });
  }
  const { id } = await ctx.params;
  if (!isValidId(id)) return new Response("Invalid id", { status: 400 });
  const data = await getKv().get(KEY(id));
  if (!data) return new Response(null, { status: 404 });
  return Response.json(data);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!kvAvailable) {
    return new Response(null, { status: 204 });
  }
  const { id } = await ctx.params;
  if (!isValidId(id)) return new Response("Invalid id", { status: 400 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = WizardSnapshotSchema.safeParse(body);
  if (!parsed.success) return new Response("Invalid payload", { status: 400 });
  await getKv().set(KEY(id), parsed.data, { ex: TTL });
  return new Response(null, { status: 204 });
}

function isValidId(id: string): boolean {
  return /^[A-Za-z0-9_-]{8,32}$/.test(id);
}
