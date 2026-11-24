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
        const [usersRes, ucRes, tasksRes] = await Promise.all([
          supabase.from('users').select('id, email, role'),
          supabase.from('use_cases').select('id, code, title'),
          supabase.from('tasks').select('id, title, status'),
        ]);

        queryData = {
          users: usersRes.data || [],
          useCases: ucRes.data || [],
          tasks: tasksRes.data || [],
        };
        queryError = usersRes.error || ucRes.error || tasksRes.error || null;
      }
    } catch (e: any) {
      queryError = { message: e.message || 'Exception during Supabase query' };
    }
  }

  return NextResponse.json({
    status: configured ? 'CONFIGURED' : 'NOT_CONFIGURED',
    environment: {
      hasUrl: Boolean(url),
      urlSample: url ? `${url.substring(0, 25)}...` : null,
      hasKey: Boolean(key),
      keyFormat: key ? (key.startsWith('sb_') ? 'NEW_API_KEY (sb_...)' : key.startsWith('eyJ') ? 'LEGACY_JWT (eyJ...)' : 'UNKNOWN') : null,
    },
    databaseTest: {
      succeeded: Boolean(queryData && !queryError),
      usersFound: queryData?.users?.length || 0,
      useCasesFound: queryData?.useCases?.length || 0,
      tasksFound: queryData?.tasks?.length || 0,
      users: queryData?.users || [],
      error: queryError || null,
    },
  });
}
