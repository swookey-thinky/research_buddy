import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('AuthToken');

  // Skip auth for public routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Verify session using a separate API endpoint
    const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session: session.value }),
    });

    if (!verifyResponse.ok) {
      throw new Error('Invalid session');
    }

    const { uid } = await verifyResponse.json();
    const response = NextResponse.next();
    response.headers.set('X-User-ID', uid);
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};