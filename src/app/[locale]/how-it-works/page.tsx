'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import {
  UserPlus,
  Search,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Briefcase,
  Users,
  Star,
  Shield,
  ArrowRight,
  Camera,
  Video,
  Palette,
  Globe,
  PenTool,
  Calendar,
  Code,
  Sparkles,
} from 'lucide-react';

const freelancerSteps = [
  { icon: <UserPlus className="h-8 w-8" />, title: '註冊檔案', titleEn: 'Create Profile', desc: '填寫你的技能、經驗和時薪，展示你的專業能力。', descEn: 'Fill in your skills, experience, and hourly rate to showcase your abilities.' },
  { icon: <Search className="h-8 w-8" />, title: '瀏覽工作', titleEn: 'Browse Jobs', desc: '探索來自香港企業的多種工作機會，找到適合你的項目。', descEn: 'Explore diverse job opportunities from Hong Kong businesses and find projects that suit you.' },
  { icon: <MessageSquare className="h-8 w-8" />, title: '提交申請', titleEn: 'Submit Proposal', desc: '發送你的提案和作品集，向僱主展示你為何是最佳人選。', descEn: 'Send your proposal and portfolio to show employers why you are the best candidate.' },
  { icon: <CheckCircle className="h-8 w-8" />, title: '完成項目', titleEn: 'Complete Project', desc: '按時高質量完成工作，累積評價，建立個人品牌。', descEn: 'Deliver quality work on time, accumulate reviews, and build your personal brand.' },
];

const employerSteps = [
  { icon: <Briefcase className="h-8 w-8" />, title: '發佈工作', titleEn: 'Post a Job', desc: '描述你的項目需求、預算和截止日期，吸引合適的自由工作者。', descEn: 'Describe your project requirements, budget, and deadline to attract suitable freelancers.' },
  { icon: <Users className="h-8 w-8" />, title: '挑選人才', titleEn: 'Choose Talent', desc: '瀏覽自由工作者檔案、作品集和評價，選擇最合適的人選。', descEn: 'Browse freelancer profiles, portfolios, and reviews to choose the best fit.' },
  { icon: <MessageSquare className="h-8 w-8" />, title: '溝通確認', titleEn: 'Communicate & Confirm', desc: '通過平台訊息功能與自由工作者溝通，確認合作細節。', descEn: 'Communicate with freelancers through the platform messaging to confirm cooperation details.' },
  { icon: <CreditCard className="h-8 w-8" />, title: '安全付款', titleEn: 'Secure Payment', desc: '通過 Stripe Connect 安全支付，款項在項目完成後才釋放。', descEn: 'Pay securely through Stripe Connect. Funds are released after project completion.' },
];

const categories = [
  { icon: <Camera className="h-6 w-6" />, name: '攝影', nameEn: 'Photography', count: 234 },
  { icon: <Video className="h-6 w-6" />, name: '錄像', nameEn: 'Videography', count: 189 },
  { icon: <Palette className="h-6 w-6" />, name: '平面設計', nameEn: 'Graphic Design', count: 312 },
  { icon: <Globe className="h-6 w-6" />, name: '社交媒體', nameEn: 'Social Media', count: 156 },
  { icon: <PenTool className="h-6 w-6" />, name: '文案撰寫', nameEn: 'Copywriting', count: 98 },
  { icon: <Calendar className="h-6 w-6" />, name: '活動策劃', nameEn: 'Event Planning', count: 87 },
  { icon: <Code className="h-6 w-6" />, name: '網頁開發', nameEn: 'Web Dev', count: 145 },
  { icon: <Sparkles className="h-6 w-6" />, name: '品牌策劃', nameEn: 'Branding', count: 76 },
];

const trustFeatures = [
  { icon: <Shield className="h-5 w-5" />, title: '安全支付', titleEn: 'Secure Payment', desc: 'Stripe Connect 保障交易安全', descEn: 'Stripe Connect ensures transaction safety' },
  { icon: <Star className="h-5 w-5" />, title: '評價系統', titleEn: 'Review System', desc: '雙方評價建立信任', descEn: 'Bilateral reviews build trust' },
  { icon: <MessageSquare className="h-5 w-5" />, title: '即時通訊', titleEn: 'Instant Messaging', desc: '平台內即時溝通', descEn: 'In-platform real-time messaging' },
];

export default function HowItWorksPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isZh = locale === 'zh-HK';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-16 text-center">
        <Badge variant="secondary" className="mb-4">{isZh ? '簡單四步' : 'Four Simple Steps'}</Badge>
        <h1 className="mb-4 text-4xl font-bold">
          {isZh ? '如何運作' : 'How It Works'}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {isZh
            ? '香港自由工作者配對平台讓僱主和自由工作者可以輕鬆連接，無論你是尋找人才還是尋找項目，都能在這裡找到答案。'
            : 'HK Freelance Match connects employers and freelancers easily. Whether you are looking for talent or projects, you can find what you need here.'}
        </p>
      </div>

      {/* For Freelancers */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">
            {isZh ? '自由工作者' : 'For Freelancers'}
          </h2>
          <p className="text-muted-foreground">
            {isZh ? '四個簡單步驟，開始你的自由職業之旅' : 'Four simple steps to start your freelance journey'}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {freelancerSteps.map((step, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <CardTitle className="text-lg">{isZh ? step.title : step.titleEn}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{isZh ? step.desc : step.descEn}</p>
                <div className="mt-4 text-3xl font-bold text-primary/20">{String(i + 1).padStart(2, '0')}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link href={`/${locale}/auth/signup?role=freelancer`}>
              {isZh ? '開始註冊自由工作者' : 'Start as Freelancer'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* For Employers */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">
            {isZh ? '僱主' : 'For Employers'}
          </h2>
          <p className="text-muted-foreground">
            {isZh ? '快速找到香港最優秀的創意人才' : 'Quickly find the best creative talent in Hong Kong'}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {employerSteps.map((step, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  {step.icon}
                </div>
                <CardTitle className="text-lg">{isZh ? step.title : step.titleEn}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{isZh ? step.desc : step.descEn}</p>
                <div className="mt-4 text-3xl font-bold text-secondary/20">{String(i + 1).padStart(2, '0')}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild size="lg" variant="secondary">
            <Link href={`/${locale}/auth/signup?role=employer`}>
              {isZh ? '開始發佈工作' : 'Post a Job'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">
            {isZh ? '涵蓋所有創意領域' : 'All Creative Fields Covered'}
          </h2>
          <p className="text-muted-foreground">
            {isZh ? '從攝影到網頁開發，找到你需要的專業人才' : 'From photography to web development, find the talent you need'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <Card key={i} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {cat.icon}
                </div>
                <p className="font-medium">{isZh ? cat.name : cat.nameEn}</p>
                <p className="text-sm text-muted-foreground">{cat.count} {isZh ? '人才' : 'talents'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trust & Safety */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">
            {isZh ? '信任與安全' : 'Trust & Safety'}
          </h2>
          <p className="text-muted-foreground">
            {isZh ? '我們的平台保障每一筆交易的安全' : 'Our platform ensures every transaction is secure'}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {trustFeatures.map((feat, i) => (
            <Card key={i} className="bg-muted/50">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {feat.icon}
                </div>
                <div>
                  <p className="font-medium">{isZh ? feat.title : feat.titleEn}</p>
                  <p className="text-sm text-muted-foreground">{isZh ? feat.desc : feat.descEn}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Card className="mx-auto max-w-2xl bg-primary text-primary-foreground">
          <CardContent className="py-8">
            <h3 className="mb-2 text-2xl font-bold">
              {isZh ? '準備好開始了嗎？' : 'Ready to Get Started?'}
            </h3>
            <p className="mb-6 opacity-90">
              {isZh
                ? '加入成千上萬的香港自由工作者和企業，發現更多機會。'
                : 'Join thousands of Hong Kong freelancers and businesses to discover more opportunities.'}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="secondary" size="lg">
                <Link href={`/${locale}/auth/signup?role=freelancer`}>
                  {isZh ? '成為自由工作者' : 'Become a Freelancer'}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link href={`/${locale}/jobs`}>
                  {isZh ? '瀏覽工作' : 'Browse Jobs'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
