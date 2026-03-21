'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBrowserClient } from '@/lib/supabase/client';
import { JOB_CATEGORIES } from '@/lib/categories';
import { Search, DollarSign, ArrowRight } from 'lucide-react';
import type { Job } from '@/lib/supabase/types';

interface JobsContentProps {
  locale: string;
}

function JobsContent({ locale }: JobsContentProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      let query = supabase
        .from('jobs')
        .select('*, profiles:employer_id (name, company_name, avatar_url)')
        .eq('status', 'open');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'budget_high') {
        query = query.order('budget_max', { ascending: false });
      } else if (sortBy === 'budget_low') {
        query = query.order('budget_min', { ascending: true });
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data } = await query;
      setJobs((data || []) as Job[]);
      setIsLoading(false);
    };

    fetchJobs();
  }, [category, sortBy, search, supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category !== 'all') params.set('category', category);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    router.push(`/${locale}/jobs?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('jobs.title')}</h1>
        <p className="text-muted-foreground">
          {locale === 'zh-HK'
            ? `共 ${jobs.length} 個工作`
            : `${jobs.length} jobs available`}
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={locale === 'zh-HK' ? '搜尋工作...' : 'Search jobs...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('jobs.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('jobs.newest')}</SelectItem>
                <SelectItem value="budget_high">{t('jobs.budgetHigh')}</SelectItem>
                <SelectItem value="budget_low">{t('jobs.budgetLow')}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              {locale === 'zh-HK' ? '搜尋' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Job Listings */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-2/3 rounded bg-muted" />
                <div className="h-4 w-1/3 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">
              {locale === 'zh-HK' ? '暫無工作' : 'No jobs found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {locale === 'zh-HK' ? '嘗試調整搜尋條件' : 'Try adjusting your search criteria'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
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
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                    {job.status === 'open' ? (locale === 'zh-HK' ? '開放' : 'Open') : job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">
                      {job.budget_min} - {job.budget_max} HKD
                    </span>
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-1">
                  <Badge variant="outline">
                    {locale === 'zh-HK'
                      ? { photography: '攝影', videography: '錄像', graphicDesign: '平面設計', socialMedia: '社交媒體', copywriting: '文案', eventPlanning: '活動策劃', webDev: '網頁開發', branding: '品牌' }[job.category] || job.category
                      : job.category}
                  </Badge>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/${locale}/jobs/${job.id}`}>
                    {locale === 'zh-HK' ? '查看詳情' : 'View Details'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface JobsPageProps {
  params: { locale: string };
}

export default function JobsPage({ params }: JobsPageProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-2/3 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    }>
      <JobsContent locale={params.locale} />
    </Suspense>
  );
}
