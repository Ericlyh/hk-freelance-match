'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBrowserClient } from '@/lib/supabase/client';
import { JOB_CATEGORIES, type JobCategory } from '@/lib/categories';
import { Search, MapPin, Clock, DollarSign, Filter, ArrowRight } from 'lucide-react';
import type { Job } from '@/lib/supabase/types';

interface JobsPageProps {
  params: Promise<{ locale: string }>;
}

export default function JobsPage({ params }: JobsPageProps) {
  const { locale } = use(params) as { locale: string };
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);

      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles:employer_id (name, company_name, avatar_url)
        `)
        .eq('status', 'open');

      // Apply category filter
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'budget_high') {
        query = query.order('budget_max', { ascending: false });
      } else if (sortBy === 'budget_low') {
        query = query.order('budget_min', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        let filteredJobs = (data || []) as Job[];

        // Apply search filter client-side for full-text search
        if (search) {
          const searchLower = search.toLowerCase();
          filteredJobs = filteredJobs.filter(
            (job) =>
              job.title.toLowerCase().includes(searchLower) ||
              job.description.toLowerCase().includes(searchLower) ||
              job.title_en?.toLowerCase().includes(searchLower) ||
              job.description_en?.toLowerCase().includes(searchLower)
          );
        }

        setJobs(filteredJobs);
      }

      setIsLoading(false);
    };

    fetchJobs();
  }, [category, sortBy, supabase, search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('jobs.title')}</h1>
          <p className="text-muted-foreground">
            {locale === 'zh-HK'
              ? '瀏覽香港創意行業的工作機會'
              : 'Browse job opportunities in HK creative industries'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/jobs/new`}>
            {t('jobs.postJob')}
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('jobs.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={category} onValueChange={(value) => setCategory(value || '')}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('jobs.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'zh-HK' ? '所有類別' : 'All Categories'}</SelectItem>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`jobs.categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value || '')}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('jobs.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('jobs.newest')}</SelectItem>
                <SelectItem value="budget_high">{t('jobs.budgetHigh')}</SelectItem>
                <SelectItem value="budget_low">{t('jobs.budgetLow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full rounded bg-muted" />
                <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">{t('jobs.noJobs')}</h3>
            <p className="text-center text-muted-foreground">{t('jobs.noJobsDesc')}</p>
            <Button className="mt-4" asChild>
              <Link href={`/${locale}/jobs/new`}>{t('jobs.postJob')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">
                      <Link href={`/${locale}/jobs/${job.id}`} className="hover:underline">
                        {locale === 'zh-HK' ? job.title : (job.title_en || job.title)}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t(`jobs.categories.${job.category}`)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {locale === 'zh-HK' ? job.description : (job.description_en || job.description)}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.budget_min} - {job.budget_max}</span>
                  </div>
                  {job.deadline && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10">
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-primary">
                      {(job.profiles as unknown as { company_name?: string; name?: string })?.company_name?.charAt(0) ||
                       (job.profiles as unknown as { company_name?: string; name?: string })?.name?.charAt(0) ||
                       'E'}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(job.profiles as unknown as { company_name?: string; name?: string })?.company_name ||
                     (job.profiles as unknown as { company_name?: string; name?: string })?.name ||
                     locale === 'zh-HK' ? '企業用戶' : 'Business User'}
                  </span>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/${locale}/jobs/${job.id}`}>
                    {t('common.view')}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
