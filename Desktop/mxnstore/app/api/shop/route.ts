import { NextResponse } from "next/server";

export const revalidate = 30;

export async function GET() {
  try {
    const apiKey = "e2f341945cdbb00a13b66fa45e9e34a24559f4f4";
    const res = await fetch(`https://fortnite-api.com/v2/shop?apiKey=${apiKey}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`Fortnite API returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch shop data" },
      { status: 500 }
    );
  }
}
