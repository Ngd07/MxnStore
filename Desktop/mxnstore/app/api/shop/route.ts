import { NextResponse } from "next/server";

export const revalidate = 30;

export async function GET() {
  try {
    const apiKey = process.env.FORTNITE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    
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
