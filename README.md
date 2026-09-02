# Tigers Eye Life

Tigers Eye Life is the Expo/React Native companion app for active Create Power members. It combines a 12-week program, strength training, nutrition logging, progress check-ins, and an in-app coach.

## Local development

```bash
npm ci
cp .env.example .env
npm run start
```

Set the public Supabase project URL and publishable key in `.env`. Without them, the app exposes a local-only development preview path.

## Quality checks

```bash
npm run typecheck
npx expo-doctor
npx expo export --platform ios
npx expo export --platform android
npx expo export --platform web
```

## Backend and releases

Supabase migrations and Edge Functions live in `supabase/`. EAS Build configuration lives in `eas.json`; the permanent iOS and Android application ID is `com.tigerseyelife.app`.

See [docs/release-readiness.md](docs/release-readiness.md) for launch status and [docs/store-listing-copy.md](docs/store-listing-copy.md) for App Store and Google Play metadata.
