import { NextResponse } from 'next/server';
import { client } from '@/lib/metrics-config'; // Use shared client

export async function GET() {
  try {
    const metrics = await client.metrics();
    
    return new NextResponse(metrics, {
      headers: { 
        'Content-Type': client.contentType,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }
}