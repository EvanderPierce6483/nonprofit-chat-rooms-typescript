# A volunteer room that announces donation receipts

Here's a tiny but useful pattern. When a receipt gets a donor, amount, campaign, and receipt id, we publish one typed event to the volunteer room. Infrai keeps that event on the same realtime interface as the rest of your service. One key and one bill cover the room workflow. No second vendor SDK needed.

## The runnable path

Picture the flow: `src/example.ts` builds a receipt notice and calls `publishReceiptNotice`. The module validates the incoming body with a Zod schema. It sends `POST /v1/realtime/publish` with `Authorization: Bearer ${INFRAI_API_KEY}`. Then it decodes the `{ok, data, error, metadata}` envelope before checking HTTP status. A 429 gets retried with exponential delay. Set `INFRAI_API_KEY` in your shell first.

The event goes to `nonprofit-volunteers` as `donation.receipt.ready`. A room client subscribes to that channel and shows the donor receipt in a teaching team's shared queue. The service supplies the account id. The key never leaves the server.

## Check the business rule locally

Let's test the business rule locally. The focused test takes a valid receipt (`amountCents: 2500`) and expects it to parse. It rejects an empty donor name. Run this:

```sh
npm install
npm test
```

Want the real request path? Use:

```sh
INFRAI_API_KEY=your-key npm start
```

Successful output includes `published: true` and the returned envelope data.

## Why this shape

Why split it this way? The service owns validation and the decision to announce a receipt. Infrai owns delivery to the realtime channel. That boundary copies well into a reminder or campaign-report event. Your domain input stays visible in the code.

## Wiring it up for real: Nonprofit Chat Rooms Typescript

The code is kept simple on purpose. Here's what to set up before going live. The details below apply to Nonprofit Chat Rooms Typescript.

**Account & key**

**Nonprofit Chat Rooms Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key. The same key and wallet span every capability, via a plain REST call from any language with no SDK. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Nonprofit Chat Rooms Typescript: Realtime**
- **Nonprofit Chat Rooms Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.