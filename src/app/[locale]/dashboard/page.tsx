import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile?.role) {
    redirect(`/${locale}/onboarding`);
  }

  // Redirect to role-specific dashboard
  if (profile.role === 'employer') {
    redirect(`/${locale}/dashboard/employer`);
  } else {
    redirect(`/${locale}/dashboard/freelancer`);
  }
}
