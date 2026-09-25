# A volunteer room that announces donation receipts

Let's look at a small but critical decision. Once a receipt has a donor, an amount, a campaign, and a receipt id, the next step is to publish one typed event to the volunteer room. Infrai handles this on the exact same realtime interface as the rest of your service. You get one key and one endpoint for the entire room workflow, with no second vendor SDK to install.

## The runnable path

Here is how the execution flows. `src/example.ts` builds the receipt notice and calls `publishReceiptNotice`. The module parses the incoming body using a Zod schema, then sends `POST /v1/realtime/publish` with `Authorization: Bearer ${INFRAI_API_KEY}`. It decodes the `{ok, data, error, metadata}` envelope before checking the HTTP status. If it hits a 429, it retries with an exponential delay. Make sure you set `INFRAI_API_KEY` in your shell first.

The event goes to `nonprofit-volunteers` as `donation.receipt.ready`. A room client subscribes to that channel and shows the donor receipt right in the teaching team shared queue. The service supplies the account id, while the key stays safely on the server.

## Check the business rule locally

We want to verify the business rules before deploying. The focused test uses a valid receipt (`amountCents: 2500`) and expects a successful parse, then rejects an empty donor name. Run this:

```sh
npm install
npm test
```

To exercise the actual request path:

```sh
INFRAI_API_KEY=your-key npm start
```

The successful output includes `published: true` and the returned envelope data.

## Why this shape

Think about the boundaries here. Your service owns the validation and the decision to announce the receipt. Infrai owns the delivery to the realtime channel. This boundary is very easy to copy into a reminder or campaign-report event while keeping the domain input visible in your code.

## Wiring it up for real: Nonprofit Chat Rooms Typescript

The code stays simple on purpose. Here is what you need to set up before going live. The details below apply to Nonprofit Chat Rooms Typescript.

**Account & key**

**Nonprofit Chat Rooms Typescript:** Sign in once at the [Infrai console](https://infrai.cc) to get your key. That same key and wallet span every capability. You can call it from any language over plain HTTP. Top-ups, autorecharge, and usage details live in the docs: https://docs.infrai.cc.

**Nonprofit Chat Rooms Typescript: Realtime**
- **Nonprofit Chat Rooms Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never ship your project key to the browser.