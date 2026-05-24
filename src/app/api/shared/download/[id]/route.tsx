import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get('Authorization');

    const response = await fetch(
      `${BACKEND_URL}/api/v1/shared/download/${id}`,
      {
        headers: {
          Authorization: authHeader || '',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to download shared item' },
        { status: response.status },
      );
    }

    // Proxy the file stream
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition':
          response.headers.get('Content-Disposition') ||
          `attachment; filename="shared-${id}"`,
      },
    });
  } catch (error: any) {
    console.error('Shared download proxy error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
