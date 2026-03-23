/**
 * Generate an .ics (iCalendar) file content for a booking
 */
export function generateICS({
  title,
  description,
  location,
  startDate,
  startTime,
  endTime,
}: {
  title: string
  description: string
  location: string
  startDate: string
  startTime: string
  endTime: string
}): string {
  const formatICSDate = (date: string, time: string) => {
    // date format: YYYY-MM-DD, time format: HH:MM
    const d = date.replace(/-/g, '');
    const t = time.replace(':', '') + '00';
    return `${d}T${t}`;
  };

  const dtStart = formatICSDate(startDate, startTime);
  const dtEnd = formatICSDate(startDate, endTime);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${Date.now()}-booking@hk-freelance-match`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HK Freelance Match//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSText(title)}`,
    description ? `DESCRIPTION:${escapeICSText(description)}` : '',
    location ? `LOCATION:${escapeICSText(location)}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}
