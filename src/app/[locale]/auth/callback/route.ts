import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? `/${request.headers.get('x-locale') || 'zh-HK'}/dashboard`;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists, if not create one
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (!existingProfile) {
        // Get role from OAuth provider or default to freelancer
        const role = data.user.user_metadata?.role || 'freelancer';
        
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          role,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/${request.headers.get('x-locale') || 'zh-HK'}/auth/signin?error=auth_callback_error`);
}
