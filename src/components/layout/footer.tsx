import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">HK</span>
              </div>
              <span className="font-bold">{t('common.appName')}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {locale === 'zh-HK'
                ? '連接香港自由工作者與企業的最佳平台'
                : 'The best platform connecting Hong Kong freelancers with businesses'}
            </p>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="mb-4 font-semibold">
              {locale === 'zh-HK' ? '自由工作者' : 'For Freelancers'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/jobs`} className="text-muted-foreground hover:text-primary">
                  {t('nav.jobs')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/auth/signup`} className="text-muted-foreground hover:text-primary">
                  {locale === 'zh-HK' ? '建立檔案' : 'Create Profile'}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="mb-4 font-semibold">
              {locale === 'zh-HK' ? '僱主' : 'For Employers'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/jobs/new`} className="text-muted-foreground hover:text-primary">
                  {t('nav.postJob')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/freelancers`} className="text-muted-foreground hover:text-primary">
                  {t('nav.freelancers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold">{t('footer.help')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="text-muted-foreground hover:text-primary">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-muted-foreground hover:text-primary">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-primary">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-primary">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="flex gap-4">
            <select
              className="rounded-md border bg-background px-2 py-1 text-sm"
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value;
                const pathname = window.location.pathname;
                const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
                window.location.href = newPathname;
              }}
            >
              <option value="zh-HK">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
