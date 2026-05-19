export type DayPeriod = 'morning' | 'afternoon' | 'evening';

const coachMessages: Record<DayPeriod, string[]> = {
  morning: ['Set the tone. One small win before noon.'],
  afternoon: ['Focus on what moves you forward, not what holds you back.'],
  evening: ['Discipline today. Freedom tomorrow.'],
};

export function getDayPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours();

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getGreeting(firstName?: string | null, date = new Date()) {
  const period = getDayPeriod(date);
  return `Good ${period}, ${firstName?.trim() || 'Friend'}.`;
}

export function getCoachMessage(date = new Date(), sessionIndex = 0) {
  const messages = coachMessages[getDayPeriod(date)];
  return messages[sessionIndex % messages.length];
}
