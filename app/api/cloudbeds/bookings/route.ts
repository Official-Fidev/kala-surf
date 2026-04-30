import { NextResponse } from "next/server";

import { CloudbedsApiError, createBooking } from "@/lib/cloudbeds/client";
import { InputValidationError, parseBookingInput } from "@/lib/validation/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[API] Booking request received:", payload);
    
    const input = parseBookingInput(payload);
    console.log("[API] Input validated successfully:", input);

    const result = await createBooking(input);
    console.log("[API] Booking created successfully:", result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Booking POST error:", error);

    if (error instanceof InputValidationError) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: error.details,
        },
        { status: error.status },
      );
    }

    if (error instanceof CloudbedsApiError) {
      console.error("[API] Cloudbeds API error details:", error.details);
      return NextResponse.json(
        {
          message: "Cloudbeds error",
          endpoint: error.endpoint,
          details: error.details,
        },
        { status: error.status || 502 },
      );
    }

    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
