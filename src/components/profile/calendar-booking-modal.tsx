'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createBrowserClient } from '@/lib/supabase/client';
import { TIME_SLOTS } from '@/lib/categories';
import { Calendar, Clock, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarBookingModalProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
  freelancerName?: string;
  jobId?: string;
  userId: string;
}

export function CalendarBookingModal({
  locale,
  isOpen,
  onClose,
  freelancerId,
  freelancerName,
  jobId,
  userId,
}: CalendarBookingModalProps) {
  const t = useTranslations();
  const supabase = createBrowserClient();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsLoading(true);

    const { error } = await supabase.from('bookings').insert({
      employer_id: userId,
      freelancer_id: freelancerId,
      job_id: jobId || null,
      date: selectedDate,
      time_slot: selectedTime,
      status: 'pending',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        locale === 'zh-HK'
          ? '預約已提交！'
          : 'Booking submitted!'
      );
      setIsConfirmed(true);
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setIsConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('calendar.title')}</DialogTitle>
          <DialogDescription>
            {locale === 'zh-HK'
              ? `與 ${freelancerName || locale === 'zh-HK' ? '自由工作者' : 'Freelancer'} 預約會議`
              : `Schedule a meeting with ${freelancerName || 'the freelancer'}`}
          </DialogDescription>
        </DialogHeader>

        {isConfirmed ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {locale === 'zh-HK' ? '預約成功！' : 'Booking Confirmed!'}
              </h3>
              <p className="text-center text-muted-foreground">
                {locale === 'zh-HK'
                  ? `已預約 ${selectedDate} ${selectedTime}`
                  : `Scheduled for ${selectedDate} at ${selectedTime}`}
              </p>
              <Button className="mt-4" onClick={handleClose}>
                {t('common.done')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Date Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{t('calendar.selectDate')}</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    className={`rounded-lg border p-2 text-center text-sm transition-colors ${
                      selectedDate === date
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs">
                      {new Date(date).toLocaleDateString(locale, { weekday: 'short' })}
                    </div>
                    <div className="font-medium">
                      {new Date(date).getDate()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{t('calendar.selectTime')}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedTime === time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation */}
            {selectedDate && selectedTime && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-center">
                  {locale === 'zh-HK' ? '預約' : 'Booking'}:{' '}
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString(locale)} {selectedTime}
                  </span>
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleBook} disabled={!selectedDate || !selectedTime || isLoading}>
                {isLoading ? t('common.loading') : t('calendar.confirmBooking')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
