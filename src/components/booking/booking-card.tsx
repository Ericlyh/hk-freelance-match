'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createBrowserClient } from '@/lib/supabase/client';
import { Calendar, Clock, DollarSign, Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { BookingWithRelations } from '@/lib/supabase/types';
import { generateICS } from '@/lib/ics';

interface BookingCardProps {
  booking: BookingWithRelations;
  locale: string;
  userId: string;
  userRole: 'employer' | 'freelancer';
  onUpdate: () => void;
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

export function BookingCard({ booking, locale, userId, userRole, onUpdate }: BookingCardProps) {
  const t = useTranslations();
  const supabase = createBrowserClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const isEmployer = userRole === 'employer';
  const isFreelancer = userRole === 'freelancer';
  const otherName = isEmployer
    ? booking.freelancer_profile?.name || booking.freelancer_profile?.company_name
    : booking.employer_profile?.company_name || booking.employer_profile?.name;
  const otherAvatar = isEmployer
    ? booking.freelancer_profile?.avatar_url || booking.freelancer_profile?.company_logo
    : booking.employer_profile?.avatar_url || booking.employer_profile?.company_logo;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'zh-HK' ? 'zh-HK' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAccept = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', booking.id);
    if (error) toast.error(error.message);
    else toast.success(locale === 'zh-HK' ? '已接受預約' : 'Booking accepted');
    setIsUpdating(false);
    onUpdate();
  };

  const handleDecline = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'declined' })
      .eq('id', booking.id);
    if (error) toast.error(error.message);
    else toast.success(locale === 'zh-HK' ? '已拒絕預約' : 'Booking declined');
    setIsUpdating(false);
    onUpdate();
  };

  const handleFundEscrow = async () => {
    console.log('[Stripe Stub] Would initiate payment flow for booking:', booking.id, 'Amount:', booking.amount);
    toast.info(locale === 'zh-HK' ? 'Stripe 支付流程已觸發（僅示範）' : 'Stripe payment flow initiated (demo only)');
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'escrow_funded' })
      .eq('id', booking.id);
    if (error) toast.error(error.message);
    else toast.success(locale === 'zh-HK' ? '訂金已支付！' : 'Escrow funded!');
    onUpdate();
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', booking.id);
    if (error) toast.error(error.message);
    else toast.success(locale === 'zh-HK' ? '工作已完成！' : 'Job completed!');
    setIsUpdating(false);
    onUpdate();
  };

  const handleDownloadICS = () => {
    const otherParty = isEmployer ? booking.freelancer_profile : booking.employer_profile;
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

  const statusLabel = STATUS_LABELS[booking.status] || { en: booking.status, zh: booking.status };
  const canAccept = isFreelancer && booking.status === 'pending';
  const canDecline = isFreelancer && booking.status === 'pending';
  const canFundEscrow = isEmployer && booking.status === 'accepted';
  const canComplete = (isEmployer || isFreelancer) && booking.status === 'escrow_funded';
  const canDownloadICS = ['accepted', 'escrow_funded', 'completed'].includes(booking.status);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherAvatar || undefined} />
              <AvatarFallback>
                {(otherName || 'U').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{otherName || (locale === 'zh-HK' ? '用戶' : 'User')}</CardTitle>
              {booking.job && (
                <p className="text-xs text-muted-foreground">
                  {locale === 'zh-HK' ? '工作: ' : 'Job: '}{booking.job.title}
                </p>
              )}
            </div>
          </div>
          <Badge variant={STATUS_VARIANTS[booking.status] || 'outline'}>
            {locale === 'zh-HK' ? statusLabel.zh : statusLabel.en}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(booking.slot_date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.slot_start} – {booking.slot_end}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1.5 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">HKD {Number(booking.amount).toLocaleString()}</span>
        </div>

        {/* Notes */}
        {(booking.employer_notes || booking.freelancer_notes) && (
          <p className="text-xs text-muted-foreground">
            {isEmployer && booking.employer_notes ? booking.employer_notes : booking.freelancer_notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {canAccept && (
            <Button size="sm" onClick={handleAccept} disabled={isUpdating}>
              <Check className="mr-1 h-3 w-3" />
              {t('bookings.accept')}
            </Button>
          )}
          {canDecline && (
            <Button size="sm" variant="destructive" onClick={handleDecline} disabled={isUpdating}>
              <X className="mr-1 h-3 w-3" />
              {t('bookings.decline')}
            </Button>
          )}
          {canFundEscrow && (
            <Button size="sm" onClick={handleFundEscrow} disabled={isUpdating}>
              <DollarSign className="mr-1 h-3 w-3" />
              {locale === 'zh-HK' ? '支付訂金' : 'Fund Escrow'} HKD {Number(booking.amount).toLocaleString()}
            </Button>
          )}
          {canComplete && (
            <Button size="sm" variant="default" onClick={handleComplete} disabled={isUpdating}>
              <Check className="mr-1 h-3 w-3" />
              {locale === 'zh-HK' ? '完成工作' : 'Complete Job'}
            </Button>
          )}
          {canDownloadICS && (
            <Button size="sm" variant="outline" onClick={handleDownloadICS}>
              <Download className="mr-1 h-3 w-3" />
              {locale === 'zh-HK' ? '下載日程' : 'Download .ics'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
