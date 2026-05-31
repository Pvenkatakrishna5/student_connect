# StudentConnect Supabase + Vercel Deployment Guide

This app uses:

- Next.js on Vercel
- Supabase Postgres as the backend database
- Supabase Realtime for chat updates
- Prisma for database access from API routes
- NextAuth for app sessions

## 1. Supabase Setup

Create a Supabase project, then copy these values:

- Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
- Anon public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Pooled database connection string -> `DATABASE_URL`
- Direct database connection string -> `DIRECT_URL`

Use the pooled connection string for `DATABASE_URL` because Vercel serverless functions open short-lived connections. Use the direct connection string for `DIRECT_URL` because Prisma schema pushes should connect directly.

## 2. Local Environment

Create `.env.local` from `.env.example` and fill in your Supabase values.

Then sync the Prisma schema to Supabase:

```bash
npm run db:push
```

Start locally:

```bash
npm run dev
```

## 3. Enable Supabase Realtime for Messages

In Supabase, enable realtime replication for the `Message` table:

1. Open your Supabase project.
2. Go to Database -> Replication.
3. Edit the `supabase_realtime` publication.
4. Enable the `Message` table.
5. Save changes.

The app already subscribes to inserts on `public.Message` from the student, employer, and agent message pages.

## 4. Vercel Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

```text
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
ALLOW_MASTER_OTP
```

Set `NEXTAUTH_URL` to your deployed Vercel URL or custom domain, for example:

```text
https://student-connect.vercel.app
```

## 5. Deploy on Vercel

Push the repository to GitHub, import it in Vercel, add the environment variables, and deploy.

Vercel can use the default Next.js settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: handled automatically by Vercel

The `postinstall` script runs `prisma generate`, so Prisma Client is generated during Vercel installs.

## 6. Production Checks

- Registration creates users in Supabase Postgres.
- Login works with the registered account.
- Job creation writes to Supabase Postgres.
- Messages are saved through `/api/messages`.
- Realtime messages appear after enabling Supabase replication for `Message`.
- Stripe and Resend features work only after their environment variables are set.
