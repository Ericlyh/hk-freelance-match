'use client';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, FileText, MessageSquare, Plus, Users, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DashboardPageProps {
  params: { locale: string };
}

export default async function EmployerDashboardPage({ params }: DashboardPageProps) {
  const { locale } = params;
  const t = useTranslations();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'employer') {
    redirect(`/${locale}`);
  }

  // Get employer's jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      applications (count)
    `)
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false });

  const activeJobs = jobs?.filter((j) => j.status === 'open') || [];
  const totalApplications = jobs?.reduce((sum, j) => sum + (j.applications?.[0]?.count || 0), 0) || 0;

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('dashboard.employer.welcome', { name: profile.company_name || locale === 'zh-HK' ? '僱主' : 'Employer' })}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.employer.overview')}</p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/jobs/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {t('nav.postJob')}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.employer.activeJobs')}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'zh-HK' ? '正在招聘' : 'Currently hiring'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.employer.totalSpent')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 HKD</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'zh-HK' ? '總支出' : 'Total spent'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.employer.pendingApplications')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'zh-HK' ? '待處理' : 'To review'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.employer.recentMessages')}
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
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'zh-HK' ? '快速操作' : 'Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/${locale}/jobs/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {t('nav.postJob')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/freelancers`}>
                <Users className="mr-2 h-4 w-4" />
                {t('nav.freelancers')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/messages`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('nav.messages')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === 'zh-HK' ? '我的工作' : 'My Jobs'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{jobs?.length || 0}</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/jobs/my`}>
                  {t('common.view')} {t('nav.jobs')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === 'zh-HK' ? '總申請' : 'Total Applications'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{totalApplications}</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/applications`}>
                  {t('common.view')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('nav.myJobs')}</h2>
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/jobs/my`}>
              {t('common.view')} {t('nav.myJobs')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {activeJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {locale === 'zh-HK' ? '暫時沒有發佈工作' : "You haven't posted any jobs yet"}
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/${locale}/jobs/new`}>{t('nav.postJob')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeJobs.slice(0, 4).map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>
                        {t(`jobs.categories.${job.category}`)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {job.budget_min} - {job.budget_max} HKD
                    </span>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/${locale}/jobs/${job.id}`}>
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
    </div>
  );
}
