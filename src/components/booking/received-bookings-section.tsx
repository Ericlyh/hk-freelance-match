'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, CalendarCheck } from 'lucide-react';
import { BookingCard } from '@/components/booking/booking-card';
import { createBrowserClient } from '@/lib/supabase/client';
import type { BookingWithRelations, Profile } from '@/lib/supabase/types';

interface ReceivedBookingsSectionProps {
  locale: string;
  userId: string;
}

export function ReceivedBookingsSection({ locale, userId }: ReceivedBookingsSectionProps) {
  const t = useTranslations();
  const supabase = createBrowserClient();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        employer_profile:profiles!employer_id(*),
        freelancer_profile:profiles!freelancer_id(*),
        job:jobs(*)
      `)
      .eq('freelancer_id', userId)
      .order('created_at', { ascending: false });
    setBookings((data as BookingWithRelations[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [userId, supabase]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => ['accepted', 'escrow_funded'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('common.loading')}
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {locale === 'zh-HK' ? '暫無預約' : 'No booking requests yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">
          {locale === 'zh-HK' ? '待處理' : 'Pending'}
          {pendingBookings.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
              {pendingBookings.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="accepted">
          {locale === 'zh-HK' ? '已確認' : 'Accepted'}
        </TabsTrigger>
        <TabsTrigger value="completed">
          {locale === 'zh-HK' ? '已完成' : 'Completed'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {locale === 'zh-HK' ? '沒有待處理的預約' : 'No pending bookings'}
          </p>
        ) : (
          pendingBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              locale={locale}
              userId={userId}
              userRole="freelancer"
              onUpdate={fetchBookings}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="accepted" className="space-y-4">
        {acceptedBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {locale === 'zh-HK' ? '沒有已確認的預約' : 'No accepted bookings'}
          </p>
        ) : (
          acceptedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              locale={locale}
              userId={userId}
              userRole="freelancer"
              onUpdate={fetchBookings}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        {completedBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {locale === 'zh-HK' ? '沒有已完成的預約' : 'No completed bookings'}
          </p>
        ) : (
          completedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              locale={locale}
              userId={userId}
              userRole="freelancer"
              onUpdate={fetchBookings}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
