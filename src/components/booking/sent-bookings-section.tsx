'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarX, CalendarCheck } from 'lucide-react';
import { BookingCard } from '@/components/booking/booking-card';
import { createBrowserClient } from '@/lib/supabase/client';
import type { BookingWithRelations } from '@/lib/supabase/types';

interface SentBookingsSectionProps {
  locale: string;
  userId: string;
}

export function SentBookingsSection({ locale, userId }: SentBookingsSectionProps) {
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
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
    setBookings((data as BookingWithRelations[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [userId, supabase]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => ['accepted', 'escrow_funded'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const declinedBookings = bookings.filter((b) => b.status === 'declined');

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
          <CalendarX className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {locale === 'zh-HK' ? '暫無發出的預約' : 'No booking requests sent'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">
          {locale === 'zh-HK' ? '待確認' : 'Pending'}
          {pendingBookings.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
              {pendingBookings.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="active">
          {locale === 'zh-HK' ? '進行中' : 'Active'}
          {activeBookings.length > 0 && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs">
              {activeBookings.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="completed">
          {locale === 'zh-HK' ? '已完成' : 'Completed'}
        </TabsTrigger>
        <TabsTrigger value="declined">
          {locale === 'zh-HK' ? '已拒絕' : 'Declined'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {locale === 'zh-HK' ? '沒有待確認的預約' : 'No pending bookings'}
          </p>
        ) : (
          pendingBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              locale={locale}
              userId={userId}
              userRole="employer"
              onUpdate={fetchBookings}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="active" className="space-y-4">
        {activeBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {locale === 'zh-HK' ? '沒有進行中的預約' : 'No active bookings'}
          </p>
        ) : (
          activeBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              locale={locale}
              userId={userId}
              userRole="employer"
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
              userRole="employer"
              onUpdate={fetchBookings}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="declined" className="space-y-4">
        {declinedBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {locale === 'zh-HK' ? '沒有被拒絕的預約' : 'No declined bookings'}
          </p>
        ) : (
          declinedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              locale={locale}
              userId={userId}
              userRole="employer"
              onUpdate={fetchBookings}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
