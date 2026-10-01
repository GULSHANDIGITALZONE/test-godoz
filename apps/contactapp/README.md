# Contact App & Admin Panel - Web Application

This web application connects to the same **Firebase Firestore** database and **Firebase Auth** as the Android App.

## Features
- **Guest / Unauthenticated Messages**: Users can send messages without logging in.
- **Google Sign-In**: Users can sign in with Google to view live replies from Admin.
- **Admin Dashboard**: If the signed-in Google account is an Admin (e.g. `godoz.app@gmail.com` or added in Firestore `admins` collection):
  - Unlocks full Admin Panel automatically.
  - View all messages in real-time.
  - Reply directly to logged-in users.
  - Record internal notes / actions for guest messages.
  - Delete messages.
  - Manage and add new Admin emails.

## How to Run locally or Deploy:
1. **Directly in Browser**:
   - Open `web/index.html` directly in Google Chrome / Edge / Firefox.
   - Note: For Google Sign-In popups to work smoothly, run a local web server (e.g. Live Server in VS Code, or `python -m http.server 8000`).

2. **Firebase Hosting / Vercel / Netlify**:
   - Upload `web/index.html` to Firebase Hosting, Vercel, or Netlify.
   - Add your domain to Firebase Auth > Settings > Authorized Domains in Firebase Console.
