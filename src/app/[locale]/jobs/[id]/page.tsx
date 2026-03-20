'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@/lib/supabase/client';
import { JOB_CATEGORIES } from '@/lib/categories';
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, Building2, Calendar, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Job, Profile, Application } from '@/lib/supabase/types';

interface JobDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { locale, id } = use(params) as { locale: string; id: string };
  const t = useTranslations();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [job, setJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<Profile | null>(null);
  const [user, setUser] = useState<{ id: string; role?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [proposal, setProposal] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as { id: string; role?: string } | null);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);

        if (profile?.role === 'freelancer') {
          const { data: existingApp } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', id)
            .eq('freelancer_id', user.id)
            .single();
          setApplication(existingApp);
        }
      }

      const { data: jobData } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:employer_id (*)
        `)
        .eq('id', id)
        .single();

      if (jobData) {
        setJob(jobData);
        setEmployer(jobData.profiles);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [id, supabase]);

  const handleApply = async () => {
    if (!user) {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    if (!proposal.trim()) {
      toast.error(locale === 'zh-HK' ? '請填寫提案' : 'Please fill in your proposal');
      return;
    }

    setIsApplying(true);

    const { error } = await supabase.from('applications').insert({
      job_id: id,
      freelancer_id: user.id,
      proposal,
      status: 'pending',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(locale === 'zh-HK' ? '申請已提交！' : 'Application submitted!');
      router.refresh();
    }

    setIsApplying(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-muted" />
          <div className="mb-4 h-12 w-2/3 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-lg font-semibold">{t('errors.notFound')}</h3>
            <Button asChild>
              <Link href={`/${locale}/jobs`}>{t('jobs.title')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={`/${locale}/jobs`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="outline" className="mb-2">
                  {t(`jobs.categories.${job.category}`)}
                </Badge>
                <CardTitle className="text-2xl">
                  {locale === 'zh-HK' ? job.title : (job.title_en || job.title)}
                </CardTitle>
                <CardDescription className="mt-2">
                  {locale === 'zh-HK' ? '發佈於' : 'Posted'} {new Date(job.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">{job.budget_min} - {job.budget_max} HKD</span>
              </div>
              {job.deadline && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{locale === 'zh-HK' ? '截止日期' : 'Deadline'}: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('jobs.description')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {locale === 'zh-HK' ? job.description : (job.description_en || job.description)}
            </p>
          </CardContent>
        </Card>

        {/* Employer Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('profile.companyInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employer?.company_logo || employer?.avatar_url || undefined} />
                <AvatarFallback>
                  {employer?.company_name?.charAt(0) || employer?.name?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">
                  {employer?.company_name || employer?.name || locale === 'zh-HK' ? '企業用戶' : 'Business User'}
                </h4>
                {employer?.contact_name && (
                  <p className="text-sm text-muted-foreground">{employer.contact_name}</p>
                )}
                {employer?.company_bio && (
                  <p className="mt-2 text-sm text-muted-foreground">{employer.company_bio}</p>
                )}
                {employer?.website && (
                  <a
                    href={employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    {employer.website}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apply Section */}
        {job.status === 'open' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userProfile?.role === 'freelancer'
                  ? application
                    ? locale === 'zh-HK'
                      ? '已申請'
                      : 'Applied'
                    : locale === 'zh-HK'
                      ? '申請這個工作'
                      : 'Apply for this job'
                  : locale === 'zh-HK'
                    ? '聯絡僱主'
                    : 'Contact Employer'}
              </CardTitle>
              <CardDescription>
                {userProfile?.role === 'freelancer'
                  ? locale === 'zh-HK'
                    ? '提交你的提案'
                    : 'Submit your proposal'
                  : locale === 'zh-HK'
                    ? '登入後聯絡僱主'
                    : 'Sign in to contact the employer'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile?.role === 'freelancer' ? (
                application ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span>{locale === 'zh-HK' ? '你已申請這個工作' : 'You have applied for this job'}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposal">{t('jobs.proposal')}</Label>
                      <Textarea
                        id="proposal"
                        placeholder={t('jobs.proposalPlaceholder')}
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        rows={6}
                      />
                    </div>
                    <Button onClick={handleApply} disabled={isApplying}>
                      {isApplying ? (
                        t('common.loading')
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {t('jobs.apply')}
                        </>
                      )}
                    </Button>
                  </div>
                )
              ) : !user ? (
                <Button asChild>
                  <Link href={`/${locale}/auth/signin?redirect=/jobs/${id}`}>
                    {t('auth.signIn')}
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href={`/${locale}/messages?user=${employer?.user_id}`}>
                    <Send className="mr-2 h-4 w-4" />
                    {t('jobs.contact')}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
