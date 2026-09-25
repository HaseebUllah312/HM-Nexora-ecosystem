# HM Nexora file contributions

The app uploads student contributions to Firebase Storage under `contributions/{uid}/...` and stores review metadata in Firestore collection `file_contributions` with status `pending`.

Before production use:
1. Enable Firebase Storage for the Firebase project already used by the app.
2. Deploy `storage.rules` and `firestore.rules` (merge them with your production rules if you already have custom rules).
3. Build an admin/review workflow that changes approved contribution status and copies/publishes approved resources into the HM Nexora public course-file catalog / Google Drive metadata.

The mobile app does **not** automatically make a contribution public; this prevents spam and unsafe files from being shown to students.
