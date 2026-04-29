import { NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const authHeader = req.headers.get('Authorization');
    const body = await req.json();

    const url = new URL(`${BACKEND_URL}/api/v1/directories`);
    if (parentId) {
      url.searchParams.append('parentId', parentId);
    }

    const response = await axios.post(url.toString(), body, {
      headers: {
        Authorization: authHeader || '',
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || 'Backend error' },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
