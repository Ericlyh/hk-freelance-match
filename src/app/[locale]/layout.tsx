import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { createClient } from '@/lib/supabase/server';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params;

  // Validate locale
  if (!routing.locales.includes(locale as 'zh-HK' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  // Fetch user session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let headerUser = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, name, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      headerUser = {
        id: profile.id,
        email: user.email,
        name: profile.name,
        avatar: profile.avatar_url,
        role: profile.role,
      };
    }
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header locale={locale} user={headerUser} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}
