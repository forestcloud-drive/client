import { NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';
import { SigninBodyDto } from '@/dto/auth/signin-body.dto';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export async function POST(req: NextRequest) {
  try {
    const body: SigninBodyDto = await req.json();

    const response = await axios.post(
      `${BACKEND_URL}/api/v1/auth/signin`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data.message },
        { status: error.response?.data.statusCode },
      );
    }

    return NextResponse.json({ message: 'Unknown error' }, { status: 500 });
  }
}
