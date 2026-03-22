'use client';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, FileText, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DashboardPageProps {
  params: { locale: string };
}

export default async function FreelancerDashboardPage({ params }: DashboardPageProps) {
  const { locale } = params;
  const t = useTranslations();
  const supabase = createBrowserClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'freelancer') {
    redirect(`/${locale}`);
  }

  // Get freelancer's applications
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (*)
    `)
    .eq('freelancer_id', user.id);

  const pendingApplications = applications?.filter((a) => a.status === 'pending') || [];
  const activeJobs = applications?.filter((a) => a.status === 'accepted') || [];

  // Get recent messages
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (content, created_at, sender_id)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('updated_at', { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {t('dashboard.freelancer.welcome', { name: profile.name || locale === 'zh-HK' ? '自由工作者' : 'Freelancer' })}
        </h1>
        <p className="text-muted-foreground">{t('dashboard.freelancer.overview')}</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === 'zh-HK' ? '收入' : 'Earnings'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 HKD</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'zh-HK' ? '本月' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.freelancer.activeJobs')}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'zh-HK' ? '正在進行' : 'In progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.freelancer.pendingApplications')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications.length}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'zh-HK' ? '等待回覆' : 'Awaiting response'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.freelancer.recentMessages')}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'zh-HK' ? '新對話' : 'New conversations'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'zh-HK' ? '快速操作' : 'Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/${locale}/jobs`}>
                <Briefcase className="mr-2 h-4 w-4" />
                {t('nav.jobs')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/profile`}>
                <FileText className="mr-2 h-4 w-4" />
                {t('profile.editProfile')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/messages`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('nav.messages')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/freelancer/applications`}>
                <FileText className="mr-2 h-4 w-4" />
                {locale === 'zh-HK' ? '我的申請' : 'My Applications'}
                {pendingApplications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingApplications.length}
                  </Badge>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === 'zh-HK' ? '市場趨勢' : 'Market Trends'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm">
                {locale === 'zh-HK'
                  ? '本週攝影類工作增加 23%'
                  : 'Photography jobs up 23% this week'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('dashboard.freelancer.activeJobs')}</h2>
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/jobs`}>
              {t('common.view')} {t('nav.jobs')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {activeJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {locale === 'zh-HK' ? '暫時沒有進行中的工作' : 'No active jobs yet'}
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/${locale}/jobs`}>{t('nav.jobs')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeJobs.slice(0, 4).map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{application.jobs?.title}</CardTitle>
                  <CardDescription>
                    {t(`jobs.categories.${application.jobs?.category}`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {application.jobs?.budget_min} - {application.jobs?.budget_max} HKD
                    </Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/${locale}/jobs/${application.job_id}`}>
                        {t('common.view')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            {t('dashboard.freelancer.pendingApplications')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingApplications.slice(0, 4).map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{application.jobs?.title}</CardTitle>
                  <CardDescription>
                    {t(`jobs.categories.${application.jobs?.category}`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {locale === 'zh-HK' ? '等待回覆' : 'Pending'}
                    </Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/${locale}/jobs/${application.job_id}`}>
                        {t('common.view')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
