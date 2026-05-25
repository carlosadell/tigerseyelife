export type CommunicationStyle = 'bottom_line' | 'balanced' | 'walk_through';
export type CoachingTone = 'push' | 'mix' | 'encourage';
export type ResponseLength = 'concise' | 'balanced' | 'indepth';
export type ScienceDepth = 'takeaway' | 'reasoning' | 'science';

export type CoachPreferences = {
  communicationStyle: CommunicationStyle;
  tone: CoachingTone;
  responseLength: ResponseLength;
  scienceDepth: ScienceDepth;
};

export const DEFAULT_COACH_PREFERENCES: CoachPreferences = {
  communicationStyle: 'balanced',
  tone: 'mix',
  responseLength: 'balanced',
  scienceDepth: 'reasoning',
};

export const COMMUNICATION_OPTIONS: { id: CommunicationStyle; label: string; description: string }[] = [
  { id: 'bottom_line', label: 'Bottom line', description: 'Tell me what to do. Cut the setup.' },
  { id: 'balanced', label: 'Balanced', description: 'A bit of context, then the action.' },
  { id: 'walk_through', label: 'Walk me through', description: 'Help me understand the why before the how.' },
];

export const TONE_OPTIONS: { id: CoachingTone; label: string; description: string }[] = [
  { id: 'push', label: 'Push me', description: 'Hold a high bar. I work better with pressure.' },
  { id: 'mix', label: 'Mix', description: 'Push when I need it, ease off when I’m fried.' },
  { id: 'encourage', label: 'Encourage me', description: 'Affirm progress. Soft on the hard days.' },
];

export const LENGTH_OPTIONS: { id: ResponseLength; label: string; description: string }[] = [
  { id: 'concise', label: 'Concise', description: 'One or two sentences. Keep it tight.' },
  { id: 'balanced', label: 'Balanced', description: 'A short paragraph with the key point.' },
  { id: 'indepth', label: 'In-depth', description: 'Take the time to explain it fully.' },
];

export const SCIENCE_OPTIONS: { id: ScienceDepth; label: string; description: string }[] = [
  { id: 'takeaway', label: 'Just the takeaway', description: 'Skip the science. Tell me what works.' },
  { id: 'reasoning', label: 'Explain the reasoning', description: 'A line or two on why.' },
  { id: 'science', label: 'Give me the science', description: 'Mechanisms, studies, the real story.' },
];
