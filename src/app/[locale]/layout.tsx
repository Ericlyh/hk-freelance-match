import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { createBrowserClient as createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'zh-HK' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  
  // Get current user for header
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user profile
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    userProfile = profile;
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <Header
        locale={locale}
        user={user ? {
          id: user.id,
          email: user.email,
          name: userProfile?.name || userProfile?.company_name || undefined,
          avatar: userProfile?.avatar_url || undefined,
          role: userProfile?.role || undefined,
        } : null}
      />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}
