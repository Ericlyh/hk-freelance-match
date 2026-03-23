import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, DollarSign, Mail, Calendar } from 'lucide-react';
import { BookingButton } from '@/components/booking/booking-button';

interface ProfilePageProps {
  params: { locale: string; id: string };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { locale, id } = params;
  const supabase = await createClient();

  // Get the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    notFound();
  }

  // Get portfolio items
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('profile_id', id);

  // Get current user to check if viewing own profile
  const { data: { user } } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.user_id;

  // Get current user's profile to check role
  let currentUserProfile: { id: string; role: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();
    currentUserProfile = data;
  }

  if (profile.role === 'employer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.company_logo || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.company_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-4 text-2xl font-bold">
                {profile.company_name || locale === 'zh-HK' ? '公司' : 'Company'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {locale === 'zh-HK' ? '僱主' : 'Employer'}
              </p>
              {profile.contact_name && (
                <p className="mt-2 text-muted-foreground">{profile.contact_name}</p>
              )}
              {profile.company_bio && (
                <p className="mt-4 text-center">{profile.company_bio}</p>
              )}
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
              {!isOwnProfile && (
                <Button className="mt-6" asChild>
                  <Link href={`/${locale}/messages?user=${profile.user_id}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {locale === 'zh-HK' ? '發送訊息' : 'Send Message'}
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Freelancer profile
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center md:flex-row md:items-start md:gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-3xl">
                  {profile.name?.charAt(0) || 'F'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">
                  {profile.name || locale === 'zh-HK' ? '自由工作者' : 'Freelancer'}
                </h1>
                
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  {profile.hourly_rate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {profile.hourly_rate} HKD/{locale === 'zh-HK' ? '小時' : 'hr'}
                    </Badge>
                  )}
                  {profile.willing_to_travel && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {locale === 'zh-HK' ? '願意出差' : 'Willing to travel'}
                    </Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="mt-4 text-muted-foreground">{profile.bio}</p>
                )}

                {!isOwnProfile && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    <Button asChild>
                      <Link href={`/${locale}/messages?user=${profile.user_id}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        {locale === 'zh-HK' ? '發送訊息' : 'Send Message'}
                      </Link>
                    </Button>
                    {currentUserProfile && currentUserProfile.role === 'employer' && (
                      <BookingButton
                        locale={locale}
                        freelancerId={profile.id}
                        freelancerName={profile.name || undefined}
                        freelancerHourlyRate={profile.hourly_rate || undefined}
                        userId={currentUserProfile.id}
                        userRole="employer"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {locale === 'zh-HK' ? '技能' : 'Skills'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              )) || (
                <p className="text-muted-foreground">
                  {locale === 'zh-HK' ? '暫無技能' : 'No skills added'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {locale === 'zh-HK' ? '作品集' : 'Portfolio'}
            </h2>
            {portfolio && portfolio.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {portfolio.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-lg border">
                    <img
                      src={item.image_url}
                      alt={locale === 'zh-HK' ? item.title : (item.title_en || item.title)}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-2">
                      <p className="font-medium">
                        {locale === 'zh-HK' ? item.title : (item.title_en || item.title)}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {locale === 'zh-HK' ? '暫無作品' : 'No portfolio items yet'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Member Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {locale === 'zh-HK' ? '加入於' : 'Member since'}:{' '}
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
