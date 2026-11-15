
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/firebase/serverAuth';
import {
  supabaseAdmin,
  ROOM_SCANS_BUCKET,
} from '@/lib/supabase/server';

export const runtime = 'nodejs';

const SIGNED_URL_EXPIRY = 60 * 5;
const MAX_PATHS = 100;

const VALID_PATH_PATTERN =
  /^[^/]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

export async function POST(req: NextRequest) {
  // Only authenticated retailers and admins can access customer images.
  const auth = await requireRole(req, ['admin', 'retailer']);

  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        message: auth.error || 'You are not authorized to view room scans.',
      },
      { status: auth.status || 403 }
    );
  }

  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.paths)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request. Image paths are required.',
        },
        { status: 400 }
      );
    }

    const paths: unknown[] = body.paths;

    if (paths.length === 0 || paths.length > MAX_PATHS) {
      return NextResponse.json(
        {
          success: false,
          message: `Provide between 1 and ${MAX_PATHS} image paths.`,
        },
        { status: 400 }
      );
    }

    if (
      paths.some(
        (path) =>
          typeof path !== 'string' ||
          !VALID_PATH_PATTERN.test(path)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more image paths are invalid.',
        },
        { status: 400 }
      );
    }

    const uniquePaths = [...new Set(paths as string[])];

    const { data, error } = await supabaseAdmin.storage
      .from(ROOM_SCANS_BUCKET)
      .createSignedUrls(uniquePaths, SIGNED_URL_EXPIRY);

    if (error) {
      console.error('[Room Scans] Signed URL error:', error.message);

      return NextResponse.json(
        {
          success: false,
          message: 'Unable to retrieve room images.',
        },
        { status: 500 }
      );
    }

    const signedUrls = (data || [])
      .filter((item) => item.signedUrl && !item.error)
      .map((item) => ({
        path: item.path,
        signedUrl: item.signedUrl,
      }));

    return NextResponse.json({
      success: true,
      signedUrls,
      expiresIn: SIGNED_URL_EXPIRY,
    });
  } catch (error) {
    console.error('[Room Scans] Signed URL API error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong while retrieving room images.',
      },
      { status: 500 }
    );
  }
}
