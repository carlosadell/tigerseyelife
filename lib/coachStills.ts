// lib/coachStills.ts
//
// Pool of Karen/Ryan stills for the FocusHeroCard and verify-membership hero.
// Until real assets ship, falls back to a curated Unsplash set behind the
// PHOTO_ASSETS_READY flag. Swap PHOTO_URLS to the real CDN-hosted Karen/Ryan
// photos once delivered.

export const PHOTO_ASSETS_READY = false;

const REAL_PHOTOS: string[] = [
  // TODO(assets): Karen/Ryan still URLs go here.
];

const FALLBACK_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face',
];

const POOL = PHOTO_ASSETS_READY && REAL_PHOTOS.length > 0 ? REAL_PHOTOS : FALLBACK_PHOTOS;

export function coachStillForWeek(weekIndex: number): string {
  return POOL[Math.abs(weekIndex) % POOL.length];
}

export function coachStillForToday(): string {
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return POOL[epochDay % POOL.length];
}
