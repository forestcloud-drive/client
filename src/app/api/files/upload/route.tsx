import { NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle multipart/form-data
  },
};

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const authHeader = req.headers.get('Authorization');

    // Forward the multipart/form-data as a stream
    const formData = await req.formData();

    const backendUrl = parentId
      ? `${BACKEND_URL}/api/v1/files/upload?parentId=${parentId}`
      : `${BACKEND_URL}/api/v1/files/upload`;

    const response = await axios.post(backendUrl, formData, {
      headers: {
        Authorization: authHeader || '',
        // Let Axios set the correct boundary for multipart/form-data
        'Content-Type': 'multipart/form-data',
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
