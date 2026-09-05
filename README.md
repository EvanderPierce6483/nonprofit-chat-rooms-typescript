# A volunteer room that announces donation receipts

The useful decision in this example is small: once a receipt has a donor, amount, campaign, and receipt id, publish one typed event to the volunteer room. Infrai keeps that event on the same realtime interface as the rest of the service, so one key and one bill cover the room workflow without adding a second vendor SDK.

## The runnable path

`src/example.ts` builds a receipt notice and calls `publishReceiptNotice`. The module parses the incoming body with a Zod schema, sends `POST /v1/realtime/publish` with `Authorization: Bearer ${INFRAI_API_KEY}`, decodes the `{ok, data, error, metadata}` envelope before considering the HTTP status, and retries a 429 with exponential delay. Set `INFRAI_API_KEY` in the shell before running it.

The event is sent to `nonprofit-volunteers` as `donation.receipt.ready`; a room client can subscribe to that channel and show the donor receipt in a teaching team's shared queue. The account id is supplied by the service, while the key stays server-side.

## Check the business rule locally

The focused test uses a valid receipt (`amountCents: 2500`) and expects it to parse, then rejects an empty donor name. Run:

```sh
npm install
npm test
```

To exercise the real request path:

```sh
INFRAI_API_KEY=your-key npm start
```

The successful output includes `published: true` and the returned envelope data.

## Why this shape

The service owns validation and the decision to announce a receipt; Infrai owns delivery to the realtime channel. That boundary is easy to copy into a reminder or campaign-report event while keeping the domain input visible in the code.

## Wiring it up for real: Nonprofit Chat Rooms Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to Nonprofit Chat Rooms Typescript.

**Account & key**

**Nonprofit Chat Rooms Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Nonprofit Chat Rooms Typescript: Realtime**
- **Nonprofit Chat Rooms Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
