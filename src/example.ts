import { publishReceiptNotice } from "./nonprofit_chat.js";

const result = await publishReceiptNotice({ donorName: "Mina Chen", receiptId: "rcpt-1042", amountCents: 2500, campaign: "Library kits" }, "nonprofit-demo");
console.log(JSON.stringify({ published: true, result }));
