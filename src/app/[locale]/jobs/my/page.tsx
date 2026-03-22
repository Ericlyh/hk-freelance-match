'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users, ArrowRight } from 'lucide-react';
import type { Job, Profile } from '@/lib/supabase/types';

type JobWithAppCount = Job & {
  application_count: number;
};

export default function MyJobsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const t = useTranslations();
  const supabase = createBrowserClient();

  const [jobs, setJobs] = useState<JobWithAppCount[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/${locale}/auth/signin?redirect=/jobs/my`);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profileData || profileData.role !== 'employer') {
        router.push(`/${locale}`);
        return;
      }
      setProfile(profileData);

      // Get jobs with application counts
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', profileData.id)
        .order('created_at', { ascending: false });

      // Get application counts per job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);
          return { ...job, application_count: count || 0 };
        })
      );

      setJobs(jobsWithCounts);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase, router, locale]);

  const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: locale === 'zh-HK' ? '開放' : 'Open', className: 'bg-green-100 text-green-800' },
    in_progress: { label: locale === 'zh-HK' ? '進行中' : 'In Progress', className: 'bg-blue-100 text-blue-800' },
    completed: { label: locale === 'zh-HK' ? '已完成' : 'Completed', className: 'bg-gray-100 text-gray-800' },
    cancelled: { label: locale === 'zh-HK' ? '已取消' : 'Cancelled', className: 'bg-red-100 text-red-800' },
  };

  const categoryLabels: Record<string, string> = locale === 'zh-HK'
    ? {
        photography: '攝影', videography: '錄像', graphicDesign: '平面設計',
        socialMedia: '社交媒體', copywriting: '文案', eventPlanning: '活動策劃',
        webDev: '網頁開發', branding: '品牌',
      }
    : {};

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          {[1, 2].map((i) => <div key={i} className="h-24 rounded bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
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

        {/* Empty State */}
        {jobs.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const status = statusConfig[job.status] || { label: job.status, className: '' };
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
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>
                            {locale === 'zh-HK'
                              ? (categoryLabels[job.category] || job.category)
                              : job.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {job.application_count}{locale === 'zh-HK' ? '個申請' : ' applications'}
                          </span>
                        </div>
                        <div className="font-medium">
                          {job.budget_min} - {job.budget_max} HKD
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.application_count > 0 && job.status === 'open' && (
                          <Button size="sm" asChild>
                            <Link href={`/${locale}/jobs/${job.id}/applications`}>
                              {locale === 'zh-HK' ? '睇申請' : 'View Applicants'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/jobs/${job.id}`}>
                            {locale === 'zh-HK' ? '詳情' : 'Details'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
