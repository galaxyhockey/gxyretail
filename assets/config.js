/* ============================================================
   CONFIG — the only file you need to edit.
   Leave it exactly as-is and Endcap runs entirely in your browser
   (localStorage), with no sign-in and no setup. Fill it in only if
   you want your progress synced across devices via Firebase.
   ============================================================ */

/* 1. Firebase web config. Leave the apiKey starting with "PASTE" to
   stay in local-only mode. To sync across devices, paste your own
   config from: Firebase Console → Project settings → Your apps → Web.
   You may reuse the Lyceum Firebase project: Endcap keeps its data in
   users/{uid}/endcap, so the two schools never collide.
   These values are public by design; your data is protected by the
   Firestore security rules and the UID lock below, not by hiding them. */
export const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE.firebaseapp.com",
  projectId:         "PASTE",
  storageBucket:     "PASTE.appspot.com",
  messagingSenderId: "PASTE",
  appId:             "PASTE"
};

/* 2. THE LOCK. Only these Firebase Auth UIDs may use the app once
   Firebase is configured. Sign in once, then Settings → Access shows
   your UID and generates this block and firestore.rules for you.
   An empty array means "anyone who signs in" — do not ship that.
   (Ignored entirely in local-only mode.)                              */
export const ALLOWED_UIDS = [
  // "abc123YourFirebaseUidGoesHere"
];

/* 3. The masthead. Change these to make the school your own.          */
export const HOME = {
  name:    "Endcap",
  tagline: "A field school for retail management.",
  motto:   "Every price, display and staffing choice is a decision somebody made. Learn to read it.",
  founded: "A Galaxy field school"
};
