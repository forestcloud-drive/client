import { NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const body = await req.json();

    const response = await axios.put(`${BACKEND_URL}/api/v1/users/password`, body, {
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
