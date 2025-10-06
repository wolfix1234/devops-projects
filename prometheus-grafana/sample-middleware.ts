import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Continue with the request
  const response = NextResponse.next();
  
  // Add timing header for metrics collection in API routes
  response.headers.set('x-request-start', Date.now().toString());
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api/metrics|_next/static|_next/image|favicon.ico).*)',
    '/api/((?!metrics).*)',
  ],
};