'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBrowserClient } from '@/lib/supabase/client';
import { JOB_CATEGORIES } from '@/lib/categories';
import { Search, DollarSign, Star, MapPin, Filter, Users } from 'lucide-react';
import type { Profile } from '@/lib/supabase/types';

const skillLabels: Record<string, { zh: string; en: string }> = {
  photography: { zh: '攝影', en: 'Photography' },
  videography: { zh: '錄像', en: 'Videography' },
  graphicDesign: { zh: '平面設計', en: 'Graphic Design' },
  socialMedia: { zh: '社交媒體', en: 'Social Media' },
  copywriting: { zh: '文案撰寫', en: 'Copywriting' },
  eventPlanning: { zh: '活動策劃', en: 'Event Planning' },
  webDev: { zh: '網頁開發', en: 'Web Development' },
  branding: { zh: '品牌策劃', en: 'Branding' },
};

export default function FreelancersPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const isZh = locale === 'zh-HK';
  const supabase = createBrowserClient();

  const [freelancers, setFreelancers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'freelancer');

      if (search) {
        query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`);
      }

      const { data } = await query;
      setFreelancers((data || []) as Profile[]);
      setLoading(false);
    };
    fetchFreelancers();
  }, [search, supabase]);

  const filteredFreelancers = freelancers.filter((f) => {
    if (category === 'all') return true;
    return f.skills?.includes(category);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          {isZh ? '自由工作者' : 'Freelancers'}
        </h1>
        <p className="text-muted-foreground">
          {isZh
            ? `共 ${filteredFreelancers.length} 位自由工作者`
            : `${filteredFreelancers.length} freelancers`}
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={isZh ? '搜尋自由工作者...' : 'Search freelancers...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={isZh ? '所有技能' : 'All Skills'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isZh ? '所有技能' : 'All Skills'}</SelectItem>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {isZh ? skillLabels[cat]?.zh || cat : skillLabels[cat]?.en || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Freelancers Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-muted" />
                </div>
                <div className="mb-2 h-6 w-2/3 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">{isZh ? '沒有找到自由工作者' : 'No freelancers found'}</p>
            <p className="text-sm text-muted-foreground">
              {isZh ? '嘗試調整搜尋條件' : 'Try adjusting your search criteria'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFreelancers.map((freelancer) => (
            <Card key={freelancer.user_id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {freelancer.name?.charAt(0) || freelancer.company_name?.charAt(0) || 'U'}
                  </div>
                </div>

                {/* Name */}
                <h3 className="mb-1 text-center font-semibold">
                  {freelancer.name || isZh ? '未命名' : 'Unnamed'}
                </h3>

                {/* Skills */}
                <div className="mb-3 flex flex-wrap justify-center gap-1">
                  {freelancer.skills?.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {isZh ? skillLabels[skill]?.zh || skill : skillLabels[skill]?.en || skill}
                    </Badge>
                  ))}
                </div>

                {/* Hourly Rate */}
                {freelancer.hourly_rate && (
                  <div className="mb-3 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>{freelancer.hourly_rate} HKD/hr</span>
                  </div>
                )}

                {/* Location */}
                <div className="mb-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Hong Kong</span>
                </div>

                {/* View Profile Button */}
                <Button asChild className="w-full">
                  <Link href={`/${locale}/profile/${freelancer.user_id}`}>
                    {isZh ? '查看檔案' : 'View Profile'}
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
