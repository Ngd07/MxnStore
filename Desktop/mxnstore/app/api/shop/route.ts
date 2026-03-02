import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = "e2f341945cdbb00a13b66fa45e9e34a24559f4f4";
    
    const res = await fetch(`https://fortnite-api.com/v2/shop?apiKey=${apiKey}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Fortnite API returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch shop data", details: String(err) },
      { status: 500 }
    );
  }
}
