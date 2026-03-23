'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@/lib/supabase/client';
import { TIME_SLOTS } from '@/lib/categories';
import { Calendar, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

interface BookingRequestModalProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
  freelancerName?: string;
  freelancerHourlyRate?: number;
  jobId?: string;
  userId: string;
}

export function BookingRequestModal({
  locale,
  isOpen,
  onClose,
  freelancerId,
  freelancerName,
  freelancerHourlyRate,
  jobId,
  userId,
}: BookingRequestModalProps) {
  const t = useTranslations();
  const supabase = createBrowserClient();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Generate next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // Calculate amount based on time selected
  const calculateAmount = () => {
    if (!selectedStartTime || !selectedEndTime || !freelancerHourlyRate) return null;
    const start = parseInt(selectedStartTime.split(':')[0]);
    const end = parseInt(selectedEndTime.split(':')[0]);
    const hours = end - start;
    if (hours <= 0) return null;
    return hours * freelancerHourlyRate;
  };

  const amount = calculateAmount();

  const handleSubmit = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return;

    setIsLoading(true);

    const { error } = await supabase.from('bookings').insert({
      employer_id: userId,
      freelancer_id: freelancerId,
      job_id: jobId || null,
      slot_date: selectedDate,
      slot_start: selectedStartTime,
      slot_end: selectedEndTime,
      amount: amount || 0,
      employer_notes: notes || null,
      status: 'pending',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(locale === 'zh-HK' ? '預約已提交！' : 'Booking request sent!');
      setIsConfirmed(true);
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setNotes('');
    setIsConfirmed(false);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'zh-HK' ? 'zh-HK' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredEndTimes = TIME_SLOTS.filter((t) => {
    if (!selectedStartTime) return true;
    return t > selectedStartTime;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('bookings.request')}</DialogTitle>
          <DialogDescription>
            {locale === 'zh-HK'
              ? `與 ${freelancerName || (locale === 'zh-HK' ? '自由工作者' : 'Freelancer')} 預約`
              : `Book a session with ${freelancerName || 'the freelancer'}`}
          </DialogDescription>
        </DialogHeader>

        {isConfirmed ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {locale === 'zh-HK' ? '預約已提交！' : 'Booking Request Sent!'}
              </h3>
              <p className="text-center text-muted-foreground">
                {selectedDate && formatDate(selectedDate)} {selectedStartTime}–{selectedEndTime}
              </p>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                {locale === 'zh-HK'
                  ? '等待自由工作者確認'
                  : 'Waiting for freelancer confirmation'}
              </p>
              <Button className="mt-4" onClick={handleClose}>
                {t('common.done')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Date Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">{t('calendar.selectDate')}</Label>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedStartTime(null);
                      setSelectedEndTime(null);
                    }}
                    className={`rounded-md border p-1.5 text-center text-xs transition-colors ${
                      selectedDate === date
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-[10px] opacity-70">
                      {new Date(date).toLocaleDateString(locale === 'zh-HK' ? 'zh-HK' : 'en-US', { weekday: 'short' })}
                    </div>
                    <div className="font-medium">{new Date(date).getDate()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">{t('bookings.startTime')}</Label>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedStartTime(time);
                        setSelectedEndTime(null);
                      }}
                      className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                        selectedStartTime === time
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

            {/* End Time Selection */}
            {selectedStartTime && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t('bookings.endTime')}</Label>
                <div className="grid grid-cols-6 gap-1">
                  {filteredEndTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedEndTime(time)}
                      className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                        selectedEndTime === time
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

            {/* Amount Display */}
            {amount !== null && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {locale === 'zh-HK' ? '費用' : 'Estimated cost'}:
                  </span>
                  <span className="font-semibold">HKD {amount.toLocaleString()}</span>
                </div>
                {freelancerHourlyRate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {locale === 'zh-HK'
                      ? `(${selectedEndTime && selectedStartTime ? parseInt(selectedEndTime.split(':')[0]) - parseInt(selectedStartTime.split(':')[0]) : 0} 小時 × HKD ${freelancerHourlyRate}/小時)`
                      : `(${selectedEndTime && selectedStartTime ? parseInt(selectedEndTime.split(':')[0]) - parseInt(selectedStartTime.split(':')[0]) : 0} hrs × HKD ${freelancerHourlyRate}/hr)`}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm">
                {locale === 'zh-HK' ? '备注（可选）' : 'Notes (optional)'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={locale === 'zh-HK' ? '添加任何备注或要求...' : 'Add any notes or requirements...'}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedStartTime || !selectedEndTime || isLoading}
              >
                {isLoading ? t('common.loading') : t('bookings.request')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
