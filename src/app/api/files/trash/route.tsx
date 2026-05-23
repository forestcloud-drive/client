import { NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const authHeader = req.headers.get('Authorization');

    const url = parentId
      ? `${BACKEND_URL}/api/v1/files/trash?parentId=${parentId}`
      : `${BACKEND_URL}/api/v1/files/trash`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader || '',
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

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
