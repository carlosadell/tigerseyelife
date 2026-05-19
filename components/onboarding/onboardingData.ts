import { OnboardingPayload } from '../../hooks/useOnboardingStatus';

export type Baseline = Record<string, string>;
export type TrainingConfig = {
  days: string;
  dietary: string;
  duration: string;
  equipment: string;
  experience: string[];
  livePreference: string;
  nutrition: string;
};

export const practiceBaselineQuestions = [
  ['patterns', 'Patterns', 'When stress hits, how aware are you of your automatic responses?'],
  ['ownership', 'Ownership', 'How often does your health get priority over other demands?'],
  ['wisdom', 'Food + training wisdom', 'How confident are you in how you eat, train, and recover?'],
  ['energy', 'Energy', 'How is your energy by 3pm most days?'],
  ['resilience', 'Resilience', 'How well do you rebound after an off day?'],
] as const;

export const onboardingTags = {
  goals: ['Build strength', 'Bone density', 'More energy', 'Mobility', 'Balance', 'Body composition'],
  sports: ['Pickleball', 'Golf', 'Hiking', 'Cycling', 'Swimming', 'General fitness'],
  avoidances: ['Dairy-free', 'Gluten-free', 'Peanut-free', 'Shellfish-free', 'Egg-free'],
};

export const strengthExperienceOptions = [
  {
    label: "I'm a novice",
    mappedLevel: 'new',
    value: 'novice',
  },
  {
    label: "I've done some training but that was a while ago",
    mappedLevel: 'returning',
    value: 'rusty',
  },
  {
    label: "I'm currently in a program designed for me",
    mappedLevel: 'advanced',
    value: 'designed_program',
  },
  {
    label: "I'm using a gym app for my workouts",
    mappedLevel: 'returning',
    value: 'gym_app',
  },
  {
    label: "I'm familiar and comfortable with using barbells, plates and dumbbells",
    mappedLevel: 'advanced',
    value: 'free_weights_comfortable',
  },
  {
    label: "I'm familiar with the use of gym equipment machines",
    mappedLevel: 'advanced',
    value: 'machines_comfortable',
  },
] as const;

export const firstFiveMovements = [
  {
    copy: 'Feet shoulder width. Sit back like a chair. Six slow reps, only as low as feels controlled.',
    name: 'Air squat',
  },
  {
    copy: 'Hands flat at shoulder height. Lean in with control, then press away. Six steady reps.',
    name: 'Wall push-up',
  },
  {
    copy: 'Arms straight out. Pull elbows back and squeeze shoulder blades. Six intentional reps.',
    name: 'Standing row',
  },
  {
    copy: 'Soft knees. Push hips back like closing a car door. Six reps with a long spine.',
    name: 'Hip hinge',
  },
];

export const initialBaseline: Baseline = {
  energy: 'okay',
  ownership: 'sometimes',
  patterns: 'sometimes',
  resilience: 'usually',
  wisdom: 'basics',
};

export const initialTraining: TrainingConfig = {
  days: '3 days',
  dietary: 'Omnivore',
  duration: '30 min',
  equipment: 'Home basics',
  experience: ['rusty'],
  livePreference: 'Pre-recorded flexibility',
  nutrition: 'Hand portions',
};

export const initialSelectedTags: SelectedTags = {
  avoidances: [],
  goals: ['Build strength', 'More energy'],
  sports: ['General fitness'],
};

export type TagKey = keyof typeof onboardingTags;
export type SelectedTags = Record<TagKey, string[]>;
export type ExperienceLevel = OnboardingPayload['experienceLevel'];
