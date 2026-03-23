'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookingRequestModal } from '@/components/booking/booking-request-modal';
import { Calendar } from 'lucide-react';

interface BookingButtonProps {
  locale: string;
  freelancerId: string;
  freelancerName?: string;
  freelancerHourlyRate?: number;
  userId: string;
  userRole: 'employer';
}

export function BookingButton({
  locale,
  freelancerId,
  freelancerName,
  freelancerHourlyRate,
  userId,
  userRole,
}: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (userRole !== 'employer') return null;

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Calendar className="mr-2 h-4 w-4" />
        {locale === 'zh-HK' ? '預約' : 'Book'}
      </Button>
      <BookingRequestModal
        locale={locale}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        freelancerId={freelancerId}
        freelancerName={freelancerName}
        freelancerHourlyRate={freelancerHourlyRate}
        userId={userId}
      />
    </>
  );
}
