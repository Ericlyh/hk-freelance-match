'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Briefcase, DollarSign, Calendar, Check, X, Clock, MessageSquare } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Job, Profile, Application } from '@/lib/supabase/types';

type ApplicationWithJob = Application & {
  job: Job;
  employer_profile?: Profile | null;
};

export default function FreelancerApplicationsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const t = useTranslations();
  const supabase = createBrowserClient();

  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/${locale}/auth/signin?redirect=/dashboard/freelancer/applications`);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.role !== 'freelancer') {
        router.push(`/${locale}`);
        return;
      }
      setUserProfile(profile);

      const { data: apps } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs!inner (
            *,
            profiles:employer_id (
              id, name, company_name, company_logo, avatar_url, contact_name
            )
          )
        `)
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });

      setApplications((apps as ApplicationWithJob[]) || []);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase, router, locale]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const pending = applications.filter((a) => a.status === 'pending');
  const accepted = applications.filter((a) => a.status === 'accepted');
  const rejected = applications.filter((a) => a.status === 'rejected');

  const statusConfig = {
    pending: {
      badge: 'bg-yellow-100 text-yellow-800',
      label: locale === 'zh-HK' ? '待回覆' : 'Pending',
      icon: Clock,
      color: 'text-yellow-600',
    },
    accepted: {
      badge: 'bg-green-100 text-green-800',
      label: locale === 'zh-HK' ? '已接受' : 'Accepted',
      icon: Check,
      color: 'text-green-600',
    },
    rejected: {
      badge: 'bg-gray-100 text-gray-600',
      label: locale === 'zh-HK' ? '已拒絕' : 'Rejected',
      icon: X,
      color: 'text-gray-500',
    },
  };

  const ApplicationCard = ({ app }: { app: ApplicationWithJob }) => {
    const config = statusConfig[app.status as keyof typeof statusConfig];
    const StatusIcon = config.icon;
    const job = app.job;
    const employer = job.profiles;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg">
                <Link href={`/${locale}/jobs/${job.id}`} className="hover:underline">
                  {locale === 'zh-HK' ? job.title : (job.title_en || job.title)}
                </Link>
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={employer?.company_logo || employer?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {employer?.company_name?.charAt(0) || employer?.name?.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>
                <span>{employer?.company_name || employer?.name || (locale === 'zh-HK' ? '企業用戶' : 'Business')}</span>
                <span>·</span>
                <span>{new Date(app.created_at).toLocaleDateString()}</span>
              </CardDescription>
            </div>
            <Badge className={config.badge}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Job Details */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{locale === 'zh-HK'
                ? ({ photography: '攝影', videography: '錄像', graphicDesign: '平面設計', socialMedia: '社交媒體', copywriting: '文案', eventPlanning: '活動策劃', webDev: '網頁開發', branding: '品牌' } as Record<string, string>)[job.category] || job.category
                : job.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{job.budget_min} - {job.budget_max} HKD</span>
            </div>
            {job.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{locale === 'zh-HK' ? '截止' : 'Deadline'}: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Proposal Preview */}
          <div className="mb-4 rounded-md bg-muted p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {locale === 'zh-HK' ? '你的提案' : 'Your Proposal'}
            </p>
            <p className="text-sm whitespace-pre-wrap line-clamp-3">{app.proposal}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/jobs/${job.id}`}>
                {locale === 'zh-HK' ? '查看工作' : 'View Job'}
              </Link>
            </Button>
            {app.status === 'accepted' && employer?.user_id && (
              <Button size="sm" asChild>
                <Link href={`/${locale}/messages?user=${employer.user_id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {locale === 'zh-HK' ? '發送訊息' : 'Message'}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${locale}/dashboard/freelancer`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {locale === 'zh-HK' ? '我的申請' : 'My Applications'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'zh-HK' ? '追蹤你的工作申請' : 'Track your job applications'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <Clock className={`mb-2 h-5 w-5 ${statusConfig.pending.color}`} />
              <div className="text-2xl font-bold">{pending.length}</div>
              <p className="text-xs text-muted-foreground">{locale === 'zh-HK' ? '待回覆' : 'Pending'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <Check className={`mb-2 h-5 w-5 ${statusConfig.accepted.color}`} />
              <div className="text-2xl font-bold">{accepted.length}</div>
              <p className="text-xs text-muted-foreground">{locale === 'zh-HK' ? '已接受' : 'Accepted'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <X className={`mb-2 h-5 w-5 ${statusConfig.rejected.color}`} />
              <div className="text-2xl font-bold">{rejected.length}</div>
              <p className="text-xs text-muted-foreground">{locale === 'zh-HK' ? '已拒絕' : 'Rejected'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {locale === 'zh-HK' ? '暫時沒有申請' : 'No applications yet'}
              </h3>
              <p className="mb-4 text-center text-muted-foreground">
                {locale === 'zh-HK' ? '去搵你鐘意嘅工作啦！' : 'Find jobs you love and apply!'}
              </p>
              <Button asChild>
                <Link href={`/${locale}/jobs`}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  {locale === 'zh-HK' ? '睇工作' : 'Browse Jobs'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Accepted */}
        {accepted.length > 0 && (
          <div className="mb-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {locale === 'zh-HK' ? '已接受' : 'Accepted'}
            </h2>
            {accepted.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div className="mb-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {locale === 'zh-HK' ? '待回覆' : 'Pending'}
            </h2>
            {pending.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}

        {/* Rejected */}
        {rejected.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">
              {locale === 'zh-HK' ? '已拒絕' : 'Rejected'}
            </h2>
            {rejected.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
