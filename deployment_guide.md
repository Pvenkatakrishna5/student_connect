# 🚀 StudentConnect Production Deployment Guide

Your platform is now production-ready with **Real-Time Messaging** enabled. Follow these steps to take your application live.

## 1. Environment Variables Checklist
When deploying to **Vercel**, you **MUST** add these environment variables in the dashboard:

| Variable Name | Description | Example / Source |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase Connection String (with Pooler) | `postgresql://...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct Connection String | `postgresql://...:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | From Supabase API Settings |
| `NEXTAUTH_SECRET` | A secure random string for Auth | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | `https://your-domain.com` |
| `STRIPE_SECRET_KEY` | Stripe API Secret Key | From Stripe Dashboard |
| `RESEND_API_KEY` | Resend Email API Key | From Resend.com |

## 2. Activate Supabase Real-Time (MANDATORY)
For the messaging to be real-time, you must enable it in your Supabase Dashboard:
1. Go to your **Supabase Project** -> **Database** -> **Replication**.
2. Click on the **'supabase_realtime'** publication.
3. Click **'Edit'** and ensure the **'Message'** table is checked.
4. Save changes.

## 3. Database Preparation
Run this locally before your first deploy to ensure the schema is in sync:
```bash
npx prisma db push
```

## 4. Deployment Steps (Vercel)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Final production release with Real-Time Messaging"
   git push origin main
   ```
2. **Import to Vercel**: Connect your repo and add the variables from Step 1.

## 5. Verification Checklist
- [ ] **OTP Registration**: Verify phone with a 6-digit code.
- [ ] **Live Chat**: Open two browsers and send messages to see them appear instantly.
- [ ] **Payments**: Verify that hiring a student triggers the Stripe flow.

---
**Congratulations! StudentConnect is ready for launch. 🌍**
