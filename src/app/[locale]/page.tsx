'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, MessageSquare, Shield, ArrowRight, Star } from 'lucide-react';

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;
  const t = useTranslations();

  const features = [
    {
      icon: Briefcase,
      title: t('nav.jobs'),
      description: locale === 'zh-HK'
        ? '瀏覽來自香港企業的工作機會'
        : 'Browse job opportunities from HK businesses',
    },
    {
      icon: Users,
      title: t('nav.freelancers'),
      description: locale === 'zh-HK'
        ? '展示你的技能和作品集'
        : 'Showcase your skills and portfolio',
    },
    {
      icon: MessageSquare,
      title: t('nav.messages'),
      description: locale === 'zh-HK'
        ? '與客戶和自由工作者即時溝通'
        : 'Communicate instantly with clients and freelancers',
    },
    {
      icon: Shield,
      title: locale === 'zh-HK' ? '安全支付' : 'Secure Payments',
      description: locale === 'zh-HK'
        ? 'Stripe Connect 保護你的交易'
        : 'Stripe Connect protects your transactions',
    },
  ];

  const categories = [
    { key: 'photography', icon: '📷' },
    { key: 'videography', icon: '🎬' },
    { key: 'graphicDesign', icon: '🎨' },
    { key: 'socialMedia', icon: '📱' },
    { key: 'copywriting', icon: '✍️' },
    { key: 'eventPlanning', icon: '🎪' },
    { key: 'webDev', icon: '💻' },
    { key: 'branding', icon: '✨' },
  ];

  const testimonials = [
    {
      name: locale === 'zh-HK' ? '陳小姐' : 'Ms. Chan',
      role: locale === 'zh-HK' ? '平面設計師' : 'Graphic Designer',
      content: locale === 'zh-HK'
        ? '這個平台幫我找到了很多優質客戶！'
        : 'This platform helped me find many quality clients!',
      rating: 5,
    },
    {
      name: locale === 'zh-HK' ? '王先生' : 'Mr. Wong',
      role: locale === 'zh-HK' ? '初創公司創辦人' : 'Startup Founder',
      content: locale === 'zh-HK'
        ? '快速找到合適的自由工作者，省時省力'
        : 'Found the right freelancer quickly, saving time and effort',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[600px] flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4 py-24 text-center">
        <div className="container mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            {locale === 'zh-HK' ? '香港首選' : 'HK Top Choice'}
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('common.appName')}
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            {locale === 'zh-HK'
              ? '連接香港自由工作者與企業的最佳平台。找到理想人才，或展示你的專業技能。'
              : 'The best platform connecting Hong Kong freelancers with businesses. Find ideal talent or showcase your professional skills.'}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/jobs">
                {t('nav.jobs')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">{t('auth.register')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">{t('jobs.categories')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/jobs?category=${cat.key}`}
              className="flex flex-col items-center rounded-lg border p-6 transition-colors hover:bg-muted/50"
            >
              <span className="mb-2 text-4xl">{cat.icon}</span>
              <span className="text-center font-medium">
                {t(`jobs.categories.${cat.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          {locale === 'zh-HK' ? '為什麼選擇我們' : 'Why Choose Us'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardHeader>
                <feature.icon className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            {locale === 'zh-HK' ? '用戶評價' : 'Testimonials'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xl font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">{testimonial.content}</p>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">
          {locale === 'zh-HK' ? '準備好開始了嗎？' : 'Ready to get started?'}
        </h2>
        <p className="mb-8 text-muted-foreground">
          {locale === 'zh-HK'
            ? '加入成千上萬的香港自由工作者和企業'
            : 'Join thousands of Hong Kong freelancers and businesses'}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup?role=freelancer">
              {t('auth.register')} ({t('auth.freelancer')})
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup?role=employer">
              {t('auth.register')} ({t('auth.employer')})
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
