export interface XenditInvoiceInput {
  externalId: string;
  amount: number;
  description: string;
  customer: {
    given_names: string;
    surname: string;
    email: string;
    mobile_number: string;
  };
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  currency?: string;
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: string;
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  description: string;
  expiry_date: string;
  invoice_url: string;
  currency: string;
}

const XENDIT_API_URL = "https://api.xendit.co/v2/invoices";

function getXenditSecretKey(): string {
  const key = process.env.XENDIT_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Missing required environment variable: XENDIT_SECRET_KEY");
  }
  return key;
}

export async function createXenditInvoice(input: XenditInvoiceInput): Promise<XenditInvoiceResponse> {
  const secretKey = getXenditSecretKey();
  const authHeader = Buffer.from(`${secretKey}:`).toString("base64");

  const body = {
    external_id: input.externalId,
    amount: input.amount,
    description: input.description,
    customer: input.customer,
    success_redirect_url: input.successRedirectUrl,
    failure_redirect_url: input.failureRedirectUrl,
    currency: input.currency || "IDR",
  };

  const response = await fetch(XENDIT_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authHeader}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok) {
    console.error("[Xendit] Create invoice error:", payload);
    throw new Error(payload.message || "Failed to create Xendit invoice");
  }

  return payload as XenditInvoiceResponse;
}
