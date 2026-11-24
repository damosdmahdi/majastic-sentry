import { NextResponse } from 'next/server';
import { getSupabaseClient, getSupabaseUrl, getSupabaseKey, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  const configured = isSupabaseConfigured();

  let queryData: any = null;
  let queryError: any = null;

  if (configured) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('users').select('id, email, role');
        queryData = data;
        queryError = error;
      }
    } catch (e: any) {
      queryError = { message: e.message || 'Exception during Supabase query' };
    }
  }

  return NextResponse.json({
    status: configured ? 'CONFIGURED' : 'NOT_CONFIGURED',
    environment: {
      hasUrl: Boolean(url),
      urlSample: url ? `${url.substring(0, 20)}...` : null,
      hasKey: Boolean(key),
      keyFormat: key ? (key.startsWith('sb_') ? 'NEW_API_KEY (sb_...)' : key.startsWith('eyJ') ? 'LEGACY_JWT (eyJ...)' : 'UNKNOWN') : null,
    },
    databaseTest: {
      succeeded: Boolean(queryData && !queryError),
      usersFound: queryData?.length || 0,
      users: queryData || [],
      error: queryError || null,
    },
  });
}
