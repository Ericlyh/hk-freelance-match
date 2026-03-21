import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/auth/onboarding-wizard';

interface OnboardingPageProps {
  params: { locale: string };
  searchParams: Promise<{ role?: string }>;
}

export default async function OnboardingPage({ params, searchParams }: OnboardingPageProps) {
  const { locale } = params;
  const { role } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Check if user already has a complete profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If profile is complete (has name for freelancer or company_name for employer), redirect to dashboard
  if (profile) {
    if (profile.role === 'freelancer' && profile.name) {
      redirect(`/${locale}/dashboard`);
    }
    if (profile.role === 'employer' && profile.company_name) {
      redirect(`/${locale}/dashboard`);
    }
  }

  // Use role from profile or URL parameter
  const userRole = profile?.role || role;

  if (!userRole || !['freelancer', 'employer'].includes(userRole)) {
    redirect(`/${locale}/auth/signup`);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <OnboardingWizard locale={locale} userId={user.id} role={userRole as 'freelancer' | 'employer'} />
    </div>
  );
}
