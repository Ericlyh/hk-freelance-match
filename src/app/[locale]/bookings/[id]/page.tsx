'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Check,
  X,
  Download,
  User,
  Briefcase,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateICS } from '@/lib/ics';
import type { BookingWithRelations } from '@/lib/supabase/types';

interface BookingDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const STATUS_LABELS: Record<string, { en: string; zh: string }> = {
  pending: { en: 'Pending', zh: '待確認' },
  accepted: { en: 'Accepted', zh: '已接受' },
  declined: { en: 'Declined', zh: '已拒絕' },
  escrow_funded: { en: 'Escrow Funded', zh: '訂金已付' },
  completed: { en: 'Completed', zh: '已完成' },
  cancelled: { en: 'Cancelled', zh: '已取消' },
  refunded: { en: 'Refunded', zh: '已退款' },
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  accepted: 'default',
  declined: 'destructive',
  escrow_funded: 'default',
  completed: 'default',
  cancelled: 'destructive',
  refunded: 'outline',
};

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const t = useTranslations();
  const router = useRouter();
  const supabase = createBrowserClient();
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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
    const fetchBooking = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          employer_profile:profiles!employer_id(*),
          freelancer_profile:profiles!freelancer_id(*),
          job:jobs(*)
        `)
        .eq('id', id)
        .single();
      setBooking(data as BookingWithRelations | null);
      setLoading(false);
    };
    if (id) fetchBooking();
  }, [id, supabase]);

  const handleAccept = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('bookings').update({ status: 'accepted' }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(locale === 'zh-HK' ? '已接受預約' : 'Booking accepted');
      setBooking((prev) => prev ? { ...prev, status: 'accepted' } : prev);
    }
    setIsUpdating(false);
  };

  const handleDecline = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('bookings').update({ status: 'declined' }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(locale === 'zh-HK' ? '已拒絕預約' : 'Booking declined');
      setBooking((prev) => prev ? { ...prev, status: 'declined' } : prev);
    }
    setIsUpdating(false);
  };

  const handleFundEscrow = async () => {
    console.log('[Stripe Stub] Would initiate payment flow for booking:', id, 'Amount:', booking?.amount);
    toast.info(locale === 'zh-HK' ? 'Stripe 支付流程已觸發（僅示範）' : 'Stripe payment flow initiated (demo only)');
    const { error } = await supabase.from('bookings').update({ status: 'escrow_funded' }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(locale === 'zh-HK' ? '訂金已支付！' : 'Escrow funded!');
      setBooking((prev) => prev ? { ...prev, status: 'escrow_funded' } : prev);
    }
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(locale === 'zh-HK' ? '工作已完成！' : 'Job completed!');
      setBooking((prev) => prev ? { ...prev, status: 'completed' } : prev);
    }
    setIsUpdating(false);
  };

  const handleDownloadICS = () => {
    if (!booking) return;
    const otherName = currentUser?.role === 'employer'
      ? booking.freelancer_profile?.name
      : booking.employer_profile?.company_name || booking.employer_profile?.name;
    const ics = generateICS({
      title: locale === 'zh-HK' ? `與 ${otherName} 的預約` : `Booking with ${otherName}`,
      description: booking.employer_notes || booking.freelancer_notes || '',
      location: '',
      startDate: booking.slot_date || '',
      startTime: booking.slot_start || '',
      endTime: booking.slot_end || '',
    });
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${booking.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'zh-HK' ? 'zh-HK' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {locale === 'zh-HK' ? '找不到預約' : 'Booking not found'}
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/${currentUser?.role === 'employer' ? 'employer' : 'freelancer'}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {locale === 'zh-HK' ? '返回控制台' : 'Back to Dashboard'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmployer = currentUser?.role === 'employer';
  const isFreelancer = currentUser?.role === 'freelancer';
  const otherParty = isEmployer ? booking.freelancer_profile : booking.employer_profile;
  const otherPartyRole = isEmployer ? (locale === 'zh-HK' ? '自由工作者' : 'Freelancer') : (locale === 'zh-HK' ? '僱主' : 'Employer');

  const statusLabel = STATUS_LABELS[booking.status] || { en: booking.status, zh: booking.status };
  const canAccept = isFreelancer && booking.status === 'pending';
  const canDecline = isFreelancer && booking.status === 'pending';
  const canFundEscrow = isEmployer && booking.status === 'accepted';
  const canComplete = (isEmployer || isFreelancer) && booking.status === 'escrow_funded';
  const canDownloadICS = ['accepted', 'escrow_funded', 'completed'].includes(booking.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={`/${locale}/dashboard/${currentUser?.role === 'employer' ? 'employer' : 'freelancer'}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === 'zh-HK' ? '返回' : 'Back'}
          </Link>
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">
                  {locale === 'zh-HK' ? '預約詳情' : 'Booking Details'}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {locale === 'zh-HK' ? '創建於' : 'Created'} {new Date(booking.created_at).toLocaleDateString(locale === 'zh-HK' ? 'zh-HK' : 'en-US')}
                </p>
              </div>
              <Badge variant={STATUS_VARIANTS[booking.status] || 'outline'}>
                {locale === 'zh-HK' ? statusLabel.zh : statusLabel.en}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Other Party */}
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={otherParty?.avatar_url || otherParty?.company_logo || undefined} />
                <AvatarFallback className="text-xl">
                  {(otherParty?.name || otherParty?.company_name || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {otherParty?.name || otherParty?.company_name || (locale === 'zh-HK' ? '用戶' : 'User')}
                </p>
                <p className="text-sm text-muted-foreground">{otherPartyRole}</p>
              </div>
            </div>

            <Separator />

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('calendar.selectDate')}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(booking.slot_date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{locale === 'zh-HK' ? '時間' : 'Time'}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.slot_start} – {booking.slot_end}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{locale === 'zh-HK' ? '費用' : 'Amount'}</p>
                <p className="text-lg font-semibold">HKD {Number(booking.amount).toLocaleString()}</p>
              </div>
            </div>

            {/* Job Link */}
            {booking.job && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{locale === 'zh-HK' ? '關聯工作' : 'Related Job'}</p>
                    <Link
                      href={`/${locale}/jobs/${booking.job_id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {booking.job.title}
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {(booking.employer_notes || booking.freelancer_notes) && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-sm font-medium">
                    {isEmployer
                      ? (locale === 'zh-HK' ? '你的備注' : 'Your Notes')
                      : (locale === 'zh-HK' ? '僱主備注' : "Employer's Notes")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEmployer ? booking.employer_notes : booking.freelancer_notes}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {canAccept && (
                <Button onClick={handleAccept} disabled={isUpdating}>
                  <Check className="mr-2 h-4 w-4" />
                  {t('bookings.accept')}
                </Button>
              )}
              {canDecline && (
                <Button variant="destructive" onClick={handleDecline} disabled={isUpdating}>
                  <X className="mr-2 h-4 w-4" />
                  {t('bookings.decline')}
                </Button>
              )}
              {canFundEscrow && (
                <Button onClick={handleFundEscrow} disabled={isUpdating}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {locale === 'zh-HK' ? '支付訂金' : 'Fund Escrow'} HKD {Number(booking.amount).toLocaleString()}
                </Button>
              )}
              {canComplete && (
                <Button onClick={handleComplete} disabled={isUpdating}>
                  <Check className="mr-2 h-4 w-4" />
                  {locale === 'zh-HK' ? '完成工作' : 'Complete Job'}
                </Button>
              )}
              {canDownloadICS && (
                <Button variant="outline" onClick={handleDownloadICS}>
                  <Download className="mr-2 h-4 w-4" />
                  {locale === 'zh-HK' ? '下載日程' : 'Download .ics'}
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href={`/${locale}/messages?user=${otherParty?.user_id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {locale === 'zh-HK' ? '發送訊息' : 'Send Message'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
