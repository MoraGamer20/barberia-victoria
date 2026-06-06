import { addMinutes, parse, format, isBefore, startOfDay, endOfDay, isAfter, isEqual } from 'date-fns';

/**
 * Check if two time intervals overlap
 */
function intervalsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = parse(start1, 'HH:mm', new Date());
  const e1 = parse(end1, 'HH:mm', new Date());
  const s2 = parse(start2, 'HH:mm', new Date());
  const e2 = parse(end2, 'HH:mm', new Date());

  return (isBefore(s1, e2) || isEqual(s1, e2)) && (isAfter(e1, s2) || isEqual(e1, s2)) && !isEqual(e1, s2) && !isEqual(s1, e2);
}

/**
 * Calculates available time slots for a specific date and duration
 */
export function calculateAvailableSlots(
  dateStr: string, // YYYY-MM-DD
  durationMinutes: number,
  openingTime: string, // HH:mm
  closingTime: string, // HH:mm
  occupiedIntervals: { start: string; end: string }[],
  blockedIntervals: { start: string; end: string }[]
): string[] {
  const slots: string[] = [];
  
  // Create Date objects for opening and closing
  const currentDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const opening = parse(openingTime, 'HH:mm', currentDate);
  const closing = parse(closingTime, 'HH:mm', currentDate);

  const allBlocks = [...occupiedIntervals, ...blockedIntervals];

  let currentSlot = opening;

  while (isBefore(currentSlot, closing) || isEqual(currentSlot, closing)) {
    const slotStartStr = format(currentSlot, 'HH:mm');
    const slotEnd = addMinutes(currentSlot, durationMinutes);
    const slotEndStr = format(slotEnd, 'HH:mm');

    // Make sure the slot does not go past closing time
    if (isAfter(slotEnd, closing)) {
      break;
    }

    // Check if it's in the past (if the date is today)
    const now = new Date();
    if (isEqual(startOfDay(currentDate), startOfDay(now))) {
      // It's today, check if slot is already passed
      if (isBefore(currentSlot, now)) {
        currentSlot = addMinutes(currentSlot, 30);
        continue;
      }
    }

    // Check overlaps
    let hasOverlap = false;
    for (const block of allBlocks) {
      if (intervalsOverlap(slotStartStr, slotEndStr, block.start, block.end)) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      slots.push(slotStartStr);
    }

    // Increment slot by 30 minutes for the next calculation
    currentSlot = addMinutes(currentSlot, 30);
  }

  return slots;
}
