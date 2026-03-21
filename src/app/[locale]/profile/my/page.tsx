import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { FreelancerProfile } from '@/components/profile/freelancer-profile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface ProfilePageProps {
  params: { locale: string };
}

export default async function MyProfilePage({ params }: ProfilePageProps) {
  const { locale } = params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/signin?redirect=/profile`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    redirect(`/${locale}/onboarding?role=freelancer`);
  }

  if (profile.role === 'employer') {
    // For employers, show a simple profile page
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{profile.company_name || locale === 'zh-HK' ? '公司' : 'Company'}</h1>
              {profile.contact_name && (
                <p className="mt-1 text-muted-foreground">{profile.contact_name}</p>
              )}
              <p className="mt-4 text-muted-foreground">{profile.company_bio || ''}</p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-primary hover:underline"
                >
                  {profile.website}
                </a>
              )}
              <Button className="mt-6" asChild>
                <Link href={`/${locale}/settings`}>
                  {locale === 'zh-HK' ? '編輯設定' : 'Edit Settings'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get portfolio items
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('profile_id', profile.id);

  // Get availability
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_available', true);

  return (
    <FreelancerProfile
      locale={locale}
      profile={profile}
      userId={user.id}
      isOwnProfile={true}
      portfolio={portfolio || []}
      availability={availability || []}
    />
  );
}
