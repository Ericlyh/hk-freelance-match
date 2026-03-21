'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBrowserClient } from '@/lib/supabase/client';
import { JOB_CATEGORIES } from '@/lib/categories';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'sonner';



export default function NewJobPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [category, setCategory] = useState<string>('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setUserRole(profile?.role || null);
    };

    checkAuth();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/${locale}/auth/signin?redirect=/jobs/new`);
      return;
    }

    if (userRole !== 'employer') {
      toast.error(locale === 'zh-HK' ? '只有僱主可以發佈工作' : 'Only employers can post jobs');
      return;
    }

    if (!title || !description || !category || !budgetMin || !budgetMax) {
      toast.error(locale === 'zh-HK' ? '請填寫所有必填欄位' : 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title,
      title_en: titleEn || null,
      description,
      description_en: descriptionEn || null,
      category,
      budget_min: parseInt(budgetMin),
      budget_max: parseInt(budgetMax),
      deadline: deadline || null,
      status: 'open',
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success(locale === 'zh-HK' ? '工作已發佈！' : 'Job posted successfully!');
    router.push(`/${locale}/jobs`);
    router.refresh();
  };

  if (isAuthenticated === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {locale === 'zh-HK' ? '請先登入' : 'Please sign in first'}
            </h3>
            <Button asChild>
              <Link href={`/${locale}/auth/signin?redirect=/jobs/new`}>
                {t('auth.signIn')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated && userRole !== 'employer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {locale === 'zh-HK' ? '只有僱主可以發佈工作' : 'Only employers can post jobs'}
            </h3>
            <Button asChild>
              <Link href={`/${locale}/auth/signup?role=employer`}>
                {locale === 'zh-HK' ? '註冊為僱主' : 'Sign up as employer'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={`/${locale}/jobs`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('jobs.createJob')}</CardTitle>
            <CardDescription>
              {locale === 'zh-HK' ? '填寫以下資料以發佈新工作' : 'Fill in the details below to post a new job'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title (Chinese) */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {locale === 'zh-HK' ? '工作標題（中文）' : 'Job Title (Chinese)'} *
                </Label>
                <Input
                  id="title"
                  placeholder={locale === 'zh-HK' ? '例如：婚禮攝影' : 'e.g., Wedding Photography'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Title (English) */}
              <div className="space-y-2">
                <Label htmlFor="titleEn">
                  {locale === 'zh-HK' ? '工作標題（英文）' : 'Job Title (English)'}
                </Label>
                <Input
                  id="titleEn"
                  placeholder={locale === 'zh-HK' ? '例如：Wedding Photography' : 'e.g., Wedding Photography'}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">{t('jobs.category')} *</Label>
                <Select value={category} onValueChange={(value) => setCategory(value || '')} required>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'zh-HK' ? '選擇類別' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`jobs.categories.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Range */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">
                    {locale === 'zh-HK' ? '最低預算（HKD）' : 'Min Budget (HKD)'} *
                  </Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="500"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">
                    {locale === 'zh-HK' ? '最高預算（HKD）' : 'Max Budget (HKD)'} *
                  </Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="2000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">{t('jobs.deadline')}</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Description (Chinese) */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {locale === 'zh-HK' ? '工作描述（中文）' : 'Job Description (Chinese)'} *
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('jobs.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              {/* Description (English) */}
              <div className="space-y-2">
                <Label htmlFor="descriptionEn">
                  {locale === 'zh-HK' ? '工作描述（英文）' : 'Job Description (English)'}
                </Label>
                <Textarea
                  id="descriptionEn"
                  placeholder={locale === 'zh-HK' ? '英文描述（可選）' : 'English description (optional)'}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/${locale}/jobs`}>{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('common.submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
