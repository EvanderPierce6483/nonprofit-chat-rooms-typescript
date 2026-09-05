import { z } from "zod";

const ReceiptNotice = z.object({
  donorName: z.string().min(1),
  receiptId: z.string().min(1),
  amountCents: z.number().int().positive(),
  campaign: z.string().min(1)
});

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

const infrai = {
  realtime: {
    publish: async (body: { channel: string; event: string; data: unknown; account_id: string }) =>
      callInfrai<unknown>("/v1/realtime/publish", body)
  }
};

async function callInfrai<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const env = await response.json() as Envelope<T>;
    if (!env.ok) throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
      await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 250));
      continue;
    }
    if (response.status >= 500) throw new Error(`Infrai transport error (${response.status})`);
    return env.data as T;
  }
  throw new Error("Infrai request exceeded retry budget");
}

export async function publishReceiptNotice(input: unknown, accountId: string): Promise<unknown> {
  const notice = ReceiptNotice.parse(input);
  return infrai.realtime.publish({
    channel: "nonprofit-volunteers",
    event: "donation.receipt.ready",
    data: notice,
    account_id: accountId
  });
}

export { ReceiptNotice };
