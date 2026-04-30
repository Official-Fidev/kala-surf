import { NextResponse } from "next/server";

import { CloudbedsApiError, fetchAvailability } from "@/lib/cloudbeds/client";
import { InputValidationError, parseAvailabilityInput } from "@/lib/validation/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = parseAvailabilityInput(payload);
    const result = await fetchAvailability(input);
    return NextResponse.json(result);
  } catch (error) {
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
