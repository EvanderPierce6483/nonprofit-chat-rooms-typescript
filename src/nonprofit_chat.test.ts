import assert from "node:assert/strict";
import { ReceiptNotice } from "./nonprofit_chat.js";

const parsed = ReceiptNotice.parse({ donorName: "Mina Chen", receiptId: "rcpt-1042", amountCents: 2500, campaign: "Library kits" });
assert.equal(parsed.amountCents, 2500);
assert.throws(() => ReceiptNotice.parse({ donorName: "", receiptId: "rcpt-1042", amountCents: 2500, campaign: "Library kits" }));
console.log("receipt notice validation passed");
