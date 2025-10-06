import { NextResponse } from 'next/server';
import { initializeIndices } from '@/lib/elasticsearch';

export async function POST() {
  try {
    await initializeIndices();
    return NextResponse.json({ message: 'Elasticsearch indices initialized successfully' });
  } catch (error) {
    console.error('Error initializing Elasticsearch:', error);
    return NextResponse.json({ error: 'Failed to initialize Elasticsearch' }, { status: 500 });
  }
}