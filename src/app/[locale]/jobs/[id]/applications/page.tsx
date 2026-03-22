'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, X, MessageSquare, ExternalLink, Briefcase } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Job, Profile, Application } from '@/lib/supabase/types';

type ApplicationWithProfile = Application & {
  freelancer_profile?: Profile | null;
  portfolio_items?: { id: string; title: string; image_url: string }[];
};

export default function JobApplicationsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const jobId = params.id as string;
  const router = useRouter();
  const t = useTranslations();
  const supabase = createBrowserClient();

  const [job, setJob] = useState<Job | null>(null);
  const [employerProfile, setEmployerProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/auth/signin?redirect=/jobs/${jobId}/applications`);
        return;
      }
      setCurrentUser(user as { id: string });

      // Get employer profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setEmployerProfile(profile);

      // Get job
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      setJob(jobData);

      if (!jobData || profile?.role !== 'employer') {
        router.push(`/${locale}/jobs`);
        return;
      }

      // Get applications with freelancer profiles
      const { data: apps } = await supabase
        .from('applications')
        .select(`
          *,
          freelancer_profile:profiles!applications_freelancer_id_fkey (
            id, name, avatar_url, bio, bio_en, skills, hourly_rate, user_id
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      // Get portfolio items for each applicant
      if (apps && apps.length > 0) {
        const appsWithPortfolio = await Promise.all(
          apps.map(async (app) => {
            if (app.freelancer_profile) {
              const { data: portfolio } = await supabase
                .from('portfolio_items')
                .select('id, title, image_url')
                .eq('profile_id', app.freelancer_profile.id)
                .limit(4);
              return { ...app, portfolio_items: portfolio || [] };
            }
            return { ...app, portfolio_items: [] };
          })
        );
        setApplications(appsWithPortfolio);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [jobId, supabase, router, locale]);

  const handleAccept = async (app: ApplicationWithProfile) => {
    if (!currentUser || !job) return;
    setActionLoading(app.id);

    // Update application status
    const { error: appError } = await supabase
      .from('applications')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', app.id);

    if (appError) {
      toast.error(locale === 'zh-HK' ? '操作失敗' : 'Failed');
      setActionLoading(null);
      return;
    }

    // Update job status to in_progress
    await supabase
      .from('jobs')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // Reject all other pending applications for this job
    await supabase
      .from('applications')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('job_id', jobId)
      .neq('id', app.id);

    // Create or find existing conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${currentUser.id},participant_2.eq.${app.freelancer_profile?.user_id}),and(participant_1.eq.${app.freelancer_profile?.user_id},participant_2.eq.${currentUser.id})`)
      .single();

    if (!existingConv) {
      await supabase.from('conversations').insert({
        participant_1: currentUser.id,
        participant_2: app.freelancer_profile?.user_id,
      });
    }

    toast.success(
      locale === 'zh-HK'
        ? `已接受申請！已與 ${app.freelancer_profile?.name} 建立對話`
        : `Accepted! Conversation started with ${app.freelancer_profile?.name}`
    );
    router.refresh();
    setSelectedApp(null);
    setActionLoading(null);
  };

  const handleReject = async (app: ApplicationWithProfile) => {
    setActionLoading(app.id);
    const { error } = await supabase
      .from('applications')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', app.id);

    if (error) {
      toast.error(locale === 'zh-HK' ? '操作失敗' : 'Failed');
    } else {
      toast.success(locale === 'zh-HK' ? '已拒絕申請' : 'Application rejected');
      router.refresh();
    }
    setSelectedApp(null);
    setActionLoading(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const reviewedApps = applications.filter((a) => a.status !== 'pending');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${locale}/jobs/my`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {locale === 'zh-HK' ? '申請者' : 'Applicants'}
            </h1>
            <p className="text-muted-foreground">
              {job && (locale === 'zh-HK' ? job.title : (job.title_en || job.title))}
            </p>
          </div>
          <Badge variant="outline">
            {pendingApps.length}{locale === 'zh-HK' ? '個待處理' : ' pending'}
          </Badge>
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {locale === 'zh-HK' ? '暫時沒有申請' : 'No applications yet'}
              </h3>
              <p className="text-muted-foreground">
                {locale === 'zh-HK' ? '申請者會在這裡顯示' : 'Applicants will appear here'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pending Applications */}
        {pendingApps.length > 0 && (
          <div className="mb-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {locale === 'zh-HK' ? '待處理' : 'Pending'}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({pendingApps.length})
              </span>
            </h2>
            {pendingApps.map((app) => (
              <Card key={app.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={app.freelancer_profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {app.freelancer_profile?.name?.charAt(0) || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {app.freelancer_profile?.name || (locale === 'zh-HK' ? '自由工作者' : 'Freelancer')}
                      </CardTitle>
                      <CardDescription>
                        {locale === 'zh-HK' ? '申請於' : 'Applied'} {new Date(app.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {locale === 'zh-HK' ? '待處理' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Proposal */}
                  <div className="mb-4 rounded-md bg-muted p-3">
                    <p className="text-sm whitespace-pre-wrap">{app.proposal}</p>
                  </div>

                  {/* Portfolio Preview */}
                  {app.portfolio_items && app.portfolio_items.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        {locale === 'zh-HK' ? '作品集' : 'Portfolio'}
                      </p>
                      <div className="flex gap-2 overflow-x-auto">
                        {app.portfolio_items.map((item) => (
                          <img
                            key={item.id}
                            src={item.image_url}
                            alt={item.title}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/${locale}/profile/${app.freelancer_profile?.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {locale === 'zh-HK' ? '查看完整檔案' : 'View Profile'}
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleReject(app)}
                        disabled={actionLoading === app.id}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {locale === 'zh-HK' ? '拒絕' : 'Reject'}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAccept(app)}
                        disabled={actionLoading === app.id}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {locale === 'zh-HK' ? '接受' : 'Accept'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reviewed Applications */}
        {reviewedApps.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h2 className="text-lg font-semibold text-muted-foreground">
              {locale === 'zh-HK' ? '已回覆' : 'Reviewed'}
            </h2>
            {reviewedApps.map((app) => (
              <Card key={app.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={app.freelancer_profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {app.freelancer_profile?.name?.charAt(0) || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {app.freelancer_profile?.name || (locale === 'zh-HK' ? '自由工作者' : 'Freelancer')}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={app.status === 'accepted' ? 'default' : 'outline'}
                      className={app.status === 'accepted' ? 'bg-green-600' : ''}
                    >
                      {app.status === 'accepted'
                        ? (locale === 'zh-HK' ? '已接受' : 'Accepted')
                        : (locale === 'zh-HK' ? '已拒絕' : 'Rejected')}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
