import { NextResponse } from "next/server";
import { createXenditInvoice } from "@/lib/xendit/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reservationId, amount, customer, description } = body;

    if (!reservationId || !amount || !customer) {
      return NextResponse.json(
        { message: "Missing required fields: reservationId, amount, or customer" },
        { status: 400 }
      );
    }

    const invoice = await createXenditInvoice({
      externalId: reservationId,
      amount,
      description: description || `Payment for Reservation ${reservationId}`,
      customer: {
        given_names: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        mobile_number: customer.phone,
      },
      // You might want to update these with real URLs
      successRedirectUrl: `${request.headers.get("origin") || ""}?status=success&id=${reservationId}`,
      failureRedirectUrl: `${request.headers.get("origin") || ""}?status=failure&id=${reservationId}`,
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[API] Xendit Invoice error:", error);
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
