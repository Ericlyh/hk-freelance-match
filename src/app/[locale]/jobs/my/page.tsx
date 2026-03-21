import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users, MoreHorizontal } from 'lucide-react';

interface MyJobsPageProps {
  params: { locale: string };
}

export default async function MyJobsPage({ params }: MyJobsPageProps) {
  const { locale } = params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/signin?redirect=/jobs/my`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'employer') {
    redirect(`/${locale}`);
  }

  // Get employer's jobs with application counts
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      applications (count)
    `)
    .eq('employer_id', profile.id)
    .order('created_at', { ascending: false });

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{locale === 'zh-HK' ? '我的工作' : 'My Jobs'}</h1>
          <p className="text-muted-foreground">
            {locale === 'zh-HK' ? '管理你發佈的工作' : 'Manage your posted jobs'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/jobs/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {locale === 'zh-HK' ? '發佈新工作' : 'Post New Job'}
          </Link>
        </Button>
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const appCount = job.applications?.[0]?.count || 0;
            return (
              <Card key={job.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        <Link href={`/${locale}/jobs/${job.id}`} className="hover:underline">
                          {locale === 'zh-HK' ? job.title : (job.title_en || job.title)}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(job.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[job.status] || ''}>
                      {job.status === 'open' 
                        ? (locale === 'zh-HK' ? '開放' : 'Open')
                        : job.status === 'in_progress'
                          ? (locale === 'zh-HK' ? '進行中' : 'In Progress')
                          : job.status === 'completed'
                            ? (locale === 'zh-HK' ? '已完成' : 'Completed')
                            : (locale === 'zh-HK' ? '已取消' : 'Cancelled')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{locale === 'zh-HK' ? '類別' : 'Category'}: </span>
                        <span className="font-medium">
                          {locale === 'zh-HK' 
                            ? ( { photography: '攝影', videography: '錄像', graphicDesign: '平面設計', socialMedia: '社交媒體', copywriting: '文案', eventPlanning: '活動策劃', webDev: '網頁開發', branding: '品牌' } as Record<string, string>)[job.category]
                            : job.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{appCount} {locale === 'zh-HK' ? '申請' : 'applications'}</span>
                      </div>
                      <div className="font-medium">
                        {job.budget_min} - {job.budget_max} HKD
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/${locale}/jobs/${job.id}`}>
                        {locale === 'zh-HK' ? '查看詳情' : 'View Details'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {locale === 'zh-HK' ? '還沒有發佈工作' : "You haven't posted any jobs yet"}
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              {locale === 'zh-HK' 
                ? '成為第一個在平台上發佈工作的人！' 
                : 'Be the first to post a job on the platform!'}
            </p>
            <Button asChild>
              <Link href={`/${locale}/jobs/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {locale === 'zh-HK' ? '發佈工作' : 'Post a Job'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
