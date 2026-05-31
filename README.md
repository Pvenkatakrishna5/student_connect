# StudentConnect

StudentConnect is a Next.js app backed by Supabase Postgres, Prisma, Supabase Realtime, and NextAuth.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the Supabase and auth values.
3. Push the schema to Supabase:

```bash
npm run db:push
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Backend

- API routes use Prisma.
- Prisma connects to Supabase Postgres through `DATABASE_URL`.
- Schema commands use `DIRECT_URL`.
- Chat pages use Supabase Realtime subscriptions on the `Message` table.

## Deploy

Deploy with Vercel using the default Next.js build settings. Add all variables from `.env.example` to Vercel before deploying.

See `deployment_guide.md` for the full Supabase and Vercel checklist.
