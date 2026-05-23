import { NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');

    const response = await axios.put(
      `${BACKEND_URL}/api/v1/files/${id}/move`,
      body,
      {
        headers: {
          Authorization: authHeader || '',
          'Content-Type': 'application/json',
        },
      },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || 'Backend error' },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
