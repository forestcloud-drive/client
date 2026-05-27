import { NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9180';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const authHeader = req.headers.get('Authorization');

    const url = new URL(`${BACKEND_URL}/api/v1/shared`);
    if (parentId) {
      url.searchParams.append('parentId', parentId);
    }

    const response = await axios.get(url.toString(), {
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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/api/v1/shared`, body, {
      headers: {
        Authorization: authHeader || '',
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(response.data || { message: 'Success' }, {
      status: response.status,
    });
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

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const body = await req.json();

    const response = await axios.delete(`${BACKEND_URL}/api/v1/shared`, {
      headers: {
        Authorization: authHeader || '',
        'Content-Type': 'application/json',
      },
      data: body,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(response.data || { message: 'Success' }, {
      status: response.status,
    });
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
