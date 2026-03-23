'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/client';
import { BookingCard } from '@/components/booking/booking-card';
import type { BookingWithRelations } from '@/lib/supabase/types';
import { CalendarX, ArrowLeft } from 'lucide-react';

interface BookingsIndexPageProps {
  params: { locale: string };
}

export default function BookingsIndexPage({ params }: BookingsIndexPageProps) {
  const { locale } = params;
  const t = useTranslations();
  const supabase = createBrowserClient();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .single();
        setCurrentUser(profile as { id: string; role: string } | null);
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          employer_profile:profiles!employer_id(*),
          freelancer_profile:profiles!freelancer_id(*),
          job:jobs(*)
        `)
        .eq(currentUser.role === 'employer' ? 'employer_id' : 'freelancer_id', currentUser.id)
        .order('created_at', { ascending: false });
      setBookings((data as BookingWithRelations[]) || []);
      setLoading(false);
    };
    fetchBookings();
  }, [currentUser, supabase]);

  const handleUpdate = () => {
    if (currentUser) {
      supabase
        .from('bookings')
        .select(`
          *,
          employer_profile:profiles!employer_id(*),
          freelancer_profile:profiles!freelancer_id(*),
          job:jobs(*)
        `)
        .eq(currentUser.role === 'employer' ? 'employer_id' : 'freelancer_id', currentUser.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setBookings((data as BookingWithRelations[]) || []));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/${locale}/dashboard/${currentUser?.role === 'employer' ? 'employer' : 'freelancer'}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === 'zh-HK' ? '返回控制台' : 'Back to Dashboard'}
          </Link>
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold">
        {currentUser?.role === 'employer'
          ? (locale === 'zh-HK' ? '我的預約' : 'My Bookings')
          : (locale === 'zh-HK' ? '收到的預約' : 'Received Bookings')}
      </h1>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarX className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {locale === 'zh-HK' ? '暫無預約' : 'No bookings yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              locale={locale}
              userId={currentUser?.id || ''}
              userRole={currentUser?.role as 'employer' | 'freelancer'}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}