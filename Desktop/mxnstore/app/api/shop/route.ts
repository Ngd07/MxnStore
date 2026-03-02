import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    const apiKey = "e2f341945cdbb00a13b66fa45e9e34a24559f4f4";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(`https://fortnite-api.com/v2/shop?apiKey=${apiKey}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('Shop API response status:', res.status);
    if (!res.ok) {
      throw new Error(`Fortnite API returned ${res.status}`);
    }

    const data = await res.json();
    console.log('Shop API data keys:', Object.keys(data));
    return NextResponse.json(data);
  } catch (err) {
    console.error('Shop API error:', err);
    return NextResponse.json(
      { error: "Failed to fetch shop data", details: String(err) },
      { status: 500 }
    );
  }
}
