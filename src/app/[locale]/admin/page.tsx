'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  TrendingUp,
  BarChart3,
  Shield,
  ChevronRight,
  Ban,
  CheckCheck,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  freelancers: number;
  employers: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'freelancer' | 'employer';
  created_at: string;
  status?: 'active' | 'banned';
}

interface Job {
  id: string;
  title: string;
  category: string;
  budget_min: number;
  budget_max: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  employer_id: string;
  applications_count?: number;
  employer_name?: string;
}

export default function AdminDashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const isZh = locale === 'zh-HK';

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    freelancers: 0,
    employers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate loading stats - in production these would come from Supabase
    // For now we use placeholder data since DB migrations may not be applied
    const mockStats: Stats = {
      totalUsers: 24,
      totalJobs: 18,
      activeJobs: 12,
      totalApplications: 47,
      freelancers: 16,
      employers: 8,
    };
    const mockUsers: User[] = [
      { id: '1', email: 'alice@example.com', name: 'Alice Wong', role: 'freelancer', created_at: '2026-03-15T10:00:00Z' },
      { id: '2', email: 'bob@example.com', name: 'Bob Chen', role: 'employer', created_at: '2026-03-14T09:00:00Z' },
      { id: '3', email: 'carol@example.com', name: 'Carol Lam', role: 'freelancer', created_at: '2026-03-13T14:30:00Z' },
      { id: '4', email: 'david@example.com', name: 'David Lee', role: 'employer', created_at: '2026-03-12T11:00:00Z' },
      { id: '5', email: 'eva@example.com', name: 'Eva Tang', role: 'freelancer', created_at: '2026-03-11T16:00:00Z' },
    ];
    const mockJobs: Job[] = [
      { id: '1', title: 'Wedding Photography', category: 'photography', budget_min: 3000, budget_max: 8000, status: 'open', created_at: '2026-03-20T10:00:00Z', employer_id: '2', applications_count: 3, employer_name: 'Bob Chen' },
      { id: '2', title: 'Corporate Video', category: 'videography', budget_min: 5000, budget_max: 15000, status: 'open', created_at: '2026-03-19T10:00:00Z', employer_id: '4', applications_count: 5, employer_name: 'David Lee' },
      { id: '3', title: 'Logo Design', category: 'graphicDesign', budget_min: 1000, budget_max: 3000, status: 'open', created_at: '2026-03-18T10:00:00Z', employer_id: '2', applications_count: 8, employer_name: 'Bob Chen' },
      { id: '4', title: 'Social Media Campaign', category: 'socialMedia', budget_min: 2000, budget_max: 5000, status: 'in_progress', created_at: '2026-03-17T10:00:00Z', employer_id: '4', applications_count: 4, employer_name: 'David Lee' },
      { id: '5', title: 'Event Photography', category: 'photography', budget_min: 2000, budget_max: 6000, status: 'open', created_at: '2026-03-16T10:00:00Z', employer_id: '2', applications_count: 2, employer_name: 'Bob Chen' },
    ];
    setStats(mockStats);
    setUsers(mockUsers);
    setJobs(mockJobs);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.category.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'> = {
      open: 'default',
      active: 'default',
      in_progress: 'secondary',
      completed: 'default',
      cancelled: 'destructive',
      pending: 'outline',
      banned: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'open' ? (isZh ? '開放' : status) :
         status === 'in_progress' ? (isZh ? '進行中' : 'In Progress') :
         status === 'completed' ? (isZh ? '已完成' : 'Completed') :
         status === 'cancelled' ? (isZh ? '已取消' : 'Cancelled') :
         status === 'pending' ? (isZh ? '待處理' : 'Pending') :
         status === 'banned' ? (isZh ? '已封禁' : 'Banned') :
         status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'freelancer' ? 'secondary' : 'default'}>
        {role === 'freelancer' ? (isZh ? '自由工作者' : 'Freelancer') : (isZh ? '僱主' : 'Employer')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
          <p className="text-muted-foreground">
            {isZh ? '平台運營概覽與管理' : 'Platform overview and management'}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('admin.overview')}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {t('admin.users')}
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            {t('admin.jobs')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('admin.analytics')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {isZh ? '自由工作者' : 'Freelancers'}: {stats.freelancers}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isZh ? '僱主' : 'Employers'}: {stats.employers}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.totalJobs')}</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isZh ? '全部工作' : 'All jobs posted'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.activeListings')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isZh ? '正在招聘中' : 'Currently open for applications'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t('admin.totalApplications')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isZh ? '所有申請' : 'Total job applications'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t('admin.recentSignups')}</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveTab('users')}>
                    {t('common.view')} <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name || user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('admin.topCategories')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: isZh ? '攝影' : 'Photography', count: 4, color: 'bg-blue-500' },
                    { name: isZh ? '錄像' : 'Videography', count: 3, color: 'bg-purple-500' },
                    { name: isZh ? '平面設計' : 'Graphic Design', count: 3, color: 'bg-pink-500' },
                    { name: isZh ? '社交媒體' : 'Social Media', count: 2, color: 'bg-green-500' },
                    { name: isZh ? '網頁開發' : 'Web Dev', count: 2, color: 'bg-orange-500' },
                  ].map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                      <span className="flex-1 text-sm">{cat.name}</span>
                      <span className="text-sm font-medium text-muted-foreground">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{isZh ? '最近發佈的工作' : 'Recent Jobs'}</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveTab('jobs')}>
                  {t('common.view')} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.budget_min} - {job.budget_max} HKD • {isZh ? '類別' : 'Category'}: {t(`jobs.categories.${job.category}`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      <span className="text-xs text-muted-foreground">
                        {job.applications_count || 0} {isZh ? '申請' : 'applicants'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.userManagement')}</CardTitle>
              <CardDescription>
                {isZh ? '管理所有平台用戶' : 'Manage all platform users'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={isZh ? '搜尋用戶...' : 'Search users...'}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {t('admin.freelancers')} ({stats.freelancers})
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('admin.employers')} ({stats.employers})
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {isZh ? '用戶' : 'User'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {t('admin.role')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {t('admin.status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {t('admin.joined')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        {isZh ? '操作' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                              {user.name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3">{getStatusBadge(user.status || 'active')}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString(locale === 'zh-HK' ? 'zh-HK' : 'en-US')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Shield className="h-3 w-3" />
                              {isZh ? '詳情' : 'Details'}
                            </Button>
                            {user.status === 'banned' ? (
                              <Button variant="outline" size="sm" className="gap-1 text-green-600">
                                <CheckCheck className="h-3 w-3" />
                                {t('admin.unban')}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="gap-1 text-red-600">
                                <Ban className="h-3 w-3" />
                                {t('admin.ban')}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.jobModeration')}</CardTitle>
              <CardDescription>
                {isZh ? '審批和管理所有工作列表' : 'Review and manage all job listings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={isZh ? '搜尋工作...' : 'Search jobs...'}
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">
                    {t('admin.pending')} ({jobs.filter((j) => j.status === 'open').length})
                  </Button>
                  <Button variant="outline" size="sm">
                    {isZh ? '進行中' : 'In Progress'} ({jobs.filter((j) => j.status === 'in_progress').length})
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('admin.completed')} ({jobs.filter((j) => j.status === 'completed').length})
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {isZh ? '工作' : 'Job'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {t('admin.category')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {t('admin.budget')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {t('admin.status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {t('admin.applicants')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        {isZh ? '操作' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{job.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {job.employer_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {t(`jobs.categories.${job.category}`)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {job.budget_min} - {job.budget_max} HKD
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(job.status)}</td>
                        <td className="px-4 py-3 text-sm">
                          {job.applications_count || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              {t('admin.viewDetails')}
                            </Button>
                            {job.status === 'open' && (
                              <>
                                <Button variant="outline" size="sm" className="gap-1 text-green-600">
                                  <CheckCheck className="h-3 w-3" />
                                  {t('admin.approve')}
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1 text-red-600">
                                  <XCircle className="h-3 w-3" />
                                  {t('admin.reject')}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('admin.totalUsers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{isZh ? '本週 3 新用戶' : '3 new this week'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('admin.totalJobs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{isZh ? '本週 5 個新工作' : '5 new this week'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('admin.activeListings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.activeJobs / stats.totalJobs) * 100)}% {isZh ? '完成率' : 'completion rate'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('admin.totalApplications')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isZh ? '平均每工作 2.6 申請' : 'Avg 2.6 per job'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Jobs by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isZh ? '按類別分類的工作' : 'Jobs by Category'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: isZh ? '攝影' : 'Photography', count: 4, pct: 22 },
                    { name: isZh ? '錄像' : 'Videography', count: 3, pct: 17 },
                    { name: isZh ? '平面設計' : 'Graphic Design', count: 3, pct: 17 },
                    { name: isZh ? '社交媒體' : 'Social Media', count: 2, pct: 11 },
                    { name: isZh ? '網頁開發' : 'Web Dev', count: 2, pct: 11 },
                    { name: isZh ? '活動策劃' : 'Event Planning', count: 2, pct: 11 },
                    { name: isZh ? '品牌策劃' : 'Branding', count: 1, pct: 6 },
                    { name: isZh ? '文案撰寫' : 'Copywriting', count: 1, pct: 6 },
                  ].map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{cat.name}</span>
                        <span className="text-muted-foreground">{cat.count} ({cat.pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Jobs by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isZh ? '按狀態分類的工作' : 'Jobs by Status'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: isZh ? '開放' : 'Open', count: stats.activeJobs, color: 'bg-green-500' },
                    { name: isZh ? '進行中' : 'In Progress', count: jobs.filter((j) => j.status === 'in_progress').length, color: 'bg-blue-500' },
                    { name: isZh ? '已完成' : 'Completed', count: jobs.filter((j) => j.status === 'completed').length, color: 'bg-gray-500' },
                    { name: isZh ? '已取消' : 'Cancelled', count: jobs.filter((j) => j.status === 'cancelled').length, color: 'bg-red-500' },
                  ].map((status) => (
                    <div key={status.name} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${status.color}`} />
                      <span className="flex-1 text-sm">{status.name}</span>
                      <span className="text-sm font-medium">{status.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{isZh ? '平均預算' : 'Average Budget'}</span>
                    <span className="font-medium">4,500 HKD</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">{isZh ? '平均申請數' : 'Avg Applications/Job'}</span>
                    <span className="font-medium">2.6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{isZh ? '用戶增長趨勢' : 'User Growth Trend'}</CardTitle>
              <CardDescription>
                {isZh ? '過去 7 天的新用戶註冊' : 'New user registrations in the last 7 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {[
                  { day: isZh ? '週一' : 'Mon', count: 2 },
                  { day: isZh ? '週二' : 'Tue', count: 4 },
                  { day: isZh ? '週三' : 'Wed', count: 1 },
                  { day: isZh ? '週四' : 'Thu', count: 3 },
                  { day: isZh ? '週五' : 'Fri', count: 5 },
                  { day: isZh ? '週六' : 'Sat', count: 2 },
                  { day: isZh ? '週日' : 'Sun', count: 1 },
                ].map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${Math.max((d.count / 5) * 100, 10)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
