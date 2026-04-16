## 2026-04-16
- Notified all affected users that their test results had been corrected after the response-scale bug, and asked them to review their scores and report again

## 2026-04-15
- Added a new invite flow where users can invite someone else to take the test, pay for the invite, and follow up on the result afterward
- Separated invited tests more clearly from regular tests, and the score page now follows the language the specific test was actually taken in
- Added an admin-controlled maintenance mode with a dedicated status page and language picker for users
- Fixed a production issue that stopped narrative generation and refreshed the affected test results

## 2026-04-02
- Added support for PDF reports of test results with graphical presentations of factors and facets
- Improved report text and score presentation so descriptions, uncertainty measures, and totals are shown more consistently
- Fixed email verification during registration and made confirmation email re-sending reliable
- Added buttons on the score page to download the report as a PDF or send it by email

## 2026-03-08
- Added a pre-test setup step that checks the user profile before starting a test
- Users are now prompted for name, date of birth and preferred test language if missing
- Test language is now stored in the user profile and synchronized with the existing language system
- Default language now falls back to the browser language when no preference is stored

## 2026-01-13
- Added expandable descriptions of domains and facets to the score page

## 2025-12-13
- Changed narrative generation so it runs independently of scoring,
allowing scores to be displayed immediately.

## 2025-12-13
- Fixed a bug that caused the narrative to be generated multiple times.

## 2025-12-11
- Fixed a bug that caused a timeout after thirty seconds

## 2025-12-10
- Fixed bug that preented tests from starting

## 2025-11-13
- Added functionality to import tests from the jotform-solution

## 2025-11-11
- Fixed a bug in the title bar that caused it to extend beyond the right margin on mobile devices.

## 2025-11-10
- Fixed a bug that prevented passwords from being read during registration.
