import { NextResponse } from "next/server";
import { fetchItems } from "@/lib/cloudbeds/client";

export async function GET() {
  try {
    const addOns = await fetchItems();
    return NextResponse.json(addOns);
  } catch (err) {
    console.error("Error fetching add-ons from Cloudbeds:", err);
    return NextResponse.json(
      { message: "Failed to fetch add-ons from Cloudbeds" },
      { status: 500 }
    );
  }
}
