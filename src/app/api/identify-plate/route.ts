import { NextRequest, NextResponse } from 'next/server';
import { identifyLicensePlate } from '@/ai/flows/identify-license-plate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoDataUri } = body;

    if (!photoDataUri) {
      return NextResponse.json(
        { error: 'Photo data URI is required' },
        { status: 400 }
      );
    }

    // Validate data URI format
    if (!photoDataUri.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid data URI format. Must be a base64 encoded image.' },
        { status: 400 }
      );
    }

    // Call the AI flow
    const result = await identifyLicensePlate({ photoDataUri });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('License plate identification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to identify license plate', 
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Allow up to 30 seconds for AI processing

