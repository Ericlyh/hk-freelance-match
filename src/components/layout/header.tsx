'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, User, LogOut, Settings, Briefcase, MessageSquare, Home } from 'lucide-react';

interface HeaderProps {
  locale: string;
  user?: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
    role?: 'freelancer' | 'employer';
  } | null;
}

export function Header({ locale, user }: HeaderProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: `/${locale}`, label: t('nav.home'), icon: Home },
    { href: `/${locale}/jobs`, label: t('nav.jobs'), icon: Briefcase },
    { href: `/${locale}/messages`, label: t('nav.messages'), icon: MessageSquare },
  ];

  const dashboardLink = user?.role === 'employer'
    ? `/${locale}/dashboard/employer`
    : user?.role === 'freelancer'
      ? `/${locale}/dashboard/freelancer`
      : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">HK</span>
          </div>
          <span className="hidden font-bold sm:inline-block">{t('common.appName')}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {dashboardLink && (
                <Button variant="ghost" asChild>
                  <Link href={dashboardLink}>{t('nav.dashboard')}</Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && <p className="font-medium">{user.name}</p>}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.myProfile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/settings`} className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/auth/signout`} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('common.logout')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href={`/${locale}/auth/signin`}>{t('auth.signIn')}</Link>
              </Button>
              <Button asChild>
                <Link href={`/${locale}/auth/signup`}>{t('auth.register')}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}

              {dashboardLink && (
                <Link
                  href={dashboardLink}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  <Briefcase className="h-5 w-5" />
                  {t('nav.dashboard')}
                </Link>
              )}

              <div className="my-4 h-px bg-border" />

              {user ? (
                <>
                  <Link
                    href={`/${locale}/profile`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <User className="h-5 w-5" />
                    {t('nav.myProfile')}
                  </Link>
                  <Link
                    href={`/${locale}/settings`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <Settings className="h-5 w-5" />
                    {t('nav.settings')}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signout`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    {t('common.logout')}
                  </Link>
                </>
              ) : (
                <>
                  <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link href={`/${locale}/auth/signin`}>{t('auth.signIn')}</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link href={`/${locale}/auth/signup`}>{t('auth.register')}</Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
