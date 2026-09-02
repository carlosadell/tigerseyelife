# Production release readiness

Last reviewed: September 2, 2026

## Current status

The app compiles for iOS, Android, and web. TypeScript and all Expo Doctor checks pass. The EAS project and production Supabase project are connected, public EAS environment variables are configured, and the account-deletion database function is live.

The code is ready for a review branch and test builds, but it is not ready for store submission until every item in **Launch blockers** is resolved.

## UI and UX changes in this release

- Reduced member onboarding from 14 question screens plus review to six focused screens plus review.
- Combined related questions: goal and success, readiness scores, work and home context.
- Limited obstacle selection to two and made follow-up detail optional.
- Replaced the long non-member diagnostic with a single access/help screen.
- Removed fake streak, workout, membership-age, and lifetime progress statistics.
- Removed unfinished profile settings and “soon” rows that had no behavior.
- Added password recovery, an in-app privacy policy, account-data help, sign out, and permanent account deletion.
- Fixed public legal links being redirected to sign-in.
- Kept the five member destinations because each maps to an active product job: Today, Train, Fuel, Grow, and You. Fuel remains program-gated until its configured unlock week.

## Security and backend changes

- AI requests now go through an authenticated Supabase Edge Function; no private Anthropic key is shipped in the app bundle.
- Membership verification now fails closed when GHL or email delivery is not configured. The development OTP bypass requires an explicit server-only flag.
- Verification codes use secure random generation, expire after ten minutes, and are limited to one send per email per minute.
- A user can delete their own Supabase Auth record and all user-owned rows through cascading foreign keys.
- Production database migrations `0001` through `0013` are applied and database lint reports no warnings.

## Launch blockers

### 1. Configure and deploy membership verification

Set these Supabase Edge Function secrets:

- `GHL_API_KEY`
- `GHL_LOCATION_ID`
- `GHL_MEMBER_TAG` (optional; defaults to `create-power-member`)
- `RESEND_API_KEY`
- `OTP_FROM_EMAIL` (a verified sender, such as `Tigers Eye Life <app@tigerseye.life>`)

Then deploy `verify-membership` and test with a real active member and a non-member. Never set `ALLOW_DEV_MEMBERSHIP_BYPASS=true` in production.

### 2. Configure and deploy AI

Set `ANTHROPIC_API_KEY` as a Supabase secret, deploy `anthropic-proxy`, and test both coach text and meal-photo analysis. If AI will not ship in version 1.0, hide both entry points before submission instead of leaving a failing control.

### 3. Replace placeholder workout media

Migration `0012_apex_program_slotting.sql`, which is already present in the production database, contains `example.com` tutorial URLs. Replace them with approved Tigers Eye Life media or remove those media controls before users can reach them.

### 4. Public legal URLs — complete

The production web build is live and both routes load without signing in:

- Privacy Policy: `https://tigerseyelife.expo.app/privacy`
- Account deletion: `https://tigerseyelife.expo.app/delete-account`

Use these HTTPS URLs in App Store Connect and Play Console. Google requires an external account-deletion page even when deletion is also available inside the app.

### 5. Provide reviewer access and final content

- Create a stable App Review / Play Review account with active membership, completed onboarding, and representative content.
- Confirm the public support email is monitored: `hello@tigerseyelife.com`.
- Confirm Tigers Eye Life owns or is licensed to use every coach photo, workout video, logo, and curriculum item.
- Confirm the Create Power access model and any off-app payment language with the store owner. Reviewer notes must explain that the app accompanies an existing coached program and does not sell digital access inside the app.

### 6. Produce signed builds

- Run an internal iOS build and test it on a physical iPhone; no iOS EAS build exists yet.
- Run an Android preview build after backend deployment.
- Complete a full smoke test on both platforms, then create production `.ipa` and `.aab` builds.

## Required device smoke test

1. Create account, confirm email if enabled, sign in, sign out, and reset password.
2. Verify a valid member; confirm invalid and rate-limited verification paths are understandable.
3. Complete all six onboarding screens and review; kill/reopen mid-flow and confirm answers persist.
4. Open Today, complete a check-in, and confirm persistence after restart.
5. Start, resume, and complete a workout; verify history and streak values.
6. Log a meal manually and, if enabled, scan a camera and library photo.
7. Use coach text and voice input if AI is enabled; deny each permission and confirm manual input still works.
8. Open Privacy Policy and account-deletion help from signed-out and signed-in states.
9. Delete a test account and confirm it can no longer sign in and its user-owned database rows are gone.
10. Check small and large phone layouts, keyboard avoidance, VoiceOver/TalkBack labels, dark text contrast, offline errors, and slow-network loading states.

## Store-console checklist

### Apple App Store Connect

- App record uses bundle ID `com.tigerseyelife.app`.
- Privacy Policy URL is public; support URL and contact information work.
- App Privacy answers match the data inventory below.
- Age rating and health/wellness disclosures are accurate.
- Review credentials and detailed membership instructions are present.
- Export compliance and content-rights questions are answered by the account holder.

### Google Play Console

- App record uses package `com.tigerseyelife.app`.
- Data safety form matches the data inventory below.
- Account deletion URL is public and lets a former user request deletion.
- Health apps declaration is completed; the app is categorized as fitness/wellness, not a medical device.
- Content rating, target audience, ads declaration, app access instructions, and reviewer credentials are complete.
- Closed testing or any account-specific eligibility requirement shown by Play Console is completed before production access is requested.

## Privacy declaration working inventory

Confirm this against the final binary and every enabled provider before answering store forms.

| Data                                | Purpose                                | Linked to user      | Shared with processor                                    |
| ----------------------------------- | -------------------------------------- | ------------------- | -------------------------------------------------------- |
| Email address and user ID           | Account, authentication, support       | Yes                 | Supabase; Resend for verification email                  |
| Membership status and join email    | Access control                         | Yes                 | Supabase; GHL lookup                                     |
| Goals, preferences, check-ins, mood | Personalization and app functionality  | Yes                 | Supabase; Anthropic only when included in an AI request  |
| Workout and progress activity       | App functionality and personalization  | Yes                 | Supabase                                                 |
| Meal and nutrition entries          | App functionality and personalization  | Yes                 | Supabase                                                 |
| Selected meal photo                 | One-time meal analysis                 | Yes while processed | Anthropic through the authenticated proxy                |
| Spoken coach request / transcript   | Voice input and coaching               | Yes while processed | Platform speech service; Anthropic if submitted to coach |
| Concept interaction events          | Program progress and product operation | Yes                 | Supabase                                                 |

No ads, cross-app tracking, data-broker sale, precise location, contacts, HealthKit, or Health Connect integration are present in this release.

## Dependency note

`npm audit` currently reports no critical vulnerabilities. Remaining high-severity reports are in Expo/Metro build tooling and require a breaking SDK upgrade; they are not known to be runtime code included in the user-facing JavaScript bundle. Reassess them during the next Expo SDK upgrade.
