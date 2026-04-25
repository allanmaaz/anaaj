# Issues & Fixes Summary

## 1. Google Sign-In Not Working
The Google OAuth Client ID (`425942372396-...`) requires the **redirect URI** to be registered in the Google Cloud Console. If you haven't added `https://anaaj.onrender.com/register` as an authorized redirect URI, Google will block the flow. This is a **Google Cloud Console configuration issue**, not a code bug.

**Fix:** Go to https://console.cloud.google.com → APIs & Services → Credentials → Edit the OAuth Client ID → Add `https://anaaj.onrender.com/register` to Authorized redirect URIs.

## 2. Admin Order Status Not Working on Mobile
The status `<select>` dropdown in the orders table is too small on mobile. Will fix CSS.

## 3. New Admins Can't See Orders
The `AdminOrders.jsx` only checks `u.role !== 'admin'` which is correct. But the "Master Users" tab is hidden for non-master admins — that's fine. The orders should show for ALL admins. Will verify.

## 4. Data Resets (H2 In-Memory)
`jdbc:h2:mem:anaajdb` = data lost on every restart. Need to switch to **PostgreSQL** on Render (free tier available).

## 5. Server Sleeping
Render free tier sleeps after 15 min. Need a **keep-alive cron ping**.
