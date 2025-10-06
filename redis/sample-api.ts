import { NextRequest, NextResponse } from 'next/server';
import { connectRedis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const client = await connectRedis();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key parameter required' }, { status: 400 });
    }

    const value = await client.get(key);
    return NextResponse.json({ key, value });
  } catch (error) {
    return NextResponse.json({ error: 'Redis error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await connectRedis();
    const { key, value, ttl } = await request.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value required' }, { status: 400 });
    }

    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    return NextResponse.json({ error: 'Redis error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await connectRedis();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key parameter required' }, { status: 400 });
    }

    await client.del(key);
    return NextResponse.json({ success: true, deleted: key });
  } catch (error) {
    return NextResponse.json({ error: 'Redis error' }, { status: 500 });
  }
}