import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cameraUrl = searchParams.get('url');

  if (!cameraUrl) {
    return NextResponse.json(
      { error: 'Camera URL is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the camera stream with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout (increased from 5)

    const response = await fetch(cameraUrl, {
      headers: {
        'Accept': 'image/jpeg, image/*, */*',
        'User-Agent': 'CampusFlow/1.0',
      },
      signal: controller.signal,
      // @ts-ignore - Next.js fetch supports cache option
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Camera responded with status: ${response.status}`);
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    // Check for expected connection errors (including nested errors in cause)
    const errorCode = error.code || error.cause?.code;
    const errorName = error.name || error.cause?.name;

    const isExpectedError = errorName === 'AbortError' ||
                           errorCode === 'ECONNREFUSED' ||
                           errorCode === 'ECONNRESET' ||
                           errorCode === 'ETIMEDOUT' ||
                           errorCode === 'ENOTFOUND' ||
                           errorCode === 'EAI_AGAIN' ||
                           error.message?.includes('terminated');

    // Only log unexpected errors to reduce console noise
    if (!isExpectedError) {
      console.error('Camera proxy unexpected error:', error);
    }

    let errorMessage = 'Failed to fetch camera stream';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';

    // Provide specific error messages
    if (errorName === 'AbortError') {
      errorMessage = 'Connection timeout';
      errorDetails = `Cannot reach camera. The camera may be offline or not accessible from this server.`;
    } else if (errorCode === 'ECONNRESET' || error.message?.includes('terminated')) {
      errorMessage = 'Connection reset';
      errorDetails = `Camera connection was reset. The camera may be offline or not accessible.`;
    } else if (errorCode === 'UND_ERR_CONNECT_TIMEOUT' || errorCode === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout';
      errorDetails = `Cannot connect to camera. Please verify the camera is on the same network and accessible.`;
    } else if (errorCode === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
      errorDetails = `Camera refused the connection. Check if the camera service is running.`;
    } else if (errorCode === 'ENOTFOUND' || errorCode === 'EAI_AGAIN') {
      errorMessage = 'Host not found';
      errorDetails = `Cannot resolve hostname. Check if the camera URL is correct.`;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        code: error.code || error.name,
        url: cameraUrl
      },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

