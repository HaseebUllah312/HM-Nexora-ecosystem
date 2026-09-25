# HM Nexora Backend Setup — Supabase + Cloudflare + Google Drive

## 1. Supabase Auth

HM Nexora now uses Supabase Auth for:
- Register
- Sign in
- Password reset
- Session persistence
- User identity / profile metadata

Create `config/backend.json` from `config/backend.example.json`.

Build with:

```bash
flutter run --dart-define-from-file=config/backend.json
```

or:

```bash
flutter build apk --release --dart-define-from-file=config/backend.json
```

Do not put a Supabase service-role key in the app. Use the publishable/anon client key only.

## 2. Cloudflare Worker + D1

Keep your existing `DB`, `SESSION_SECRET`, and `ADMIN_TOKEN`.

Deploy the supplied:
`backend/HM_Nexora_Cloudflare_Worker_v1.4.0.js`

Run:
`backend/cloudflare_drive_schema.sql`

D1 stores metadata only. PDFs and contributed documents are not stored in D1.

## 3. Google Drive

The Worker creates a Google Drive resumable upload session and the app uploads the file bytes directly to Google Drive.

Add these Worker secrets:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_ID`

The OAuth account behind the refresh token should be the Google account whose Drive storage you want HM Nexora to use.

Flow:

App -> Cloudflare (create session) -> Google Drive upload URL
App -> Google Drive (actual file)
App -> Cloudflare (save Drive ID/link/status)

This keeps Cloudflare/D1 storage usage tiny.

## 4. VULMS

Android/iOS uses `webview_flutter` directly inside `LmsScreen`.
The old auto-launching native `VulmsActivity` path has been removed.
