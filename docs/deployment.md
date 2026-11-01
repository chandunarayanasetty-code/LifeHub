# Deploying LifeHub

LifeHub runs in two database modes:

| Mode | When | Migrations | Good for |
| --- | --- | --- | --- |
| **Embedded (PGlite)** | `DATABASE_URL` is empty | Applied at startup from `prisma/migrations` | Local development, demos, a single small server |
| **PostgreSQL** | `DATABASE_URL` is set | Applied by `npx prisma migrate deploy` | Vercel, Docker, any managed Postgres |

Production deployments should use real PostgreSQL. PGlite is a full PostgreSQL
build compiled to WebAssembly inside the Node process: it is excellent for a
zero-setup local database, but it is **single-process** and its files live on the
local disk. Serverless platforms, multiple instances, and ephemeral containers
will lose or corrupt data, so do not use it there.

---

## 1. Create a PostgreSQL database

Any managed provider works: [Neon](https://neon.tech),
[Supabase](https://supabase.com), [Railway](https://railway.app), Amazon RDS, or
a local server. Neon's free tier is a good default for a portfolio project.

Copy the connection string. It looks like:

```
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

Add `?sslmode=require` (or `&sslmode=require` if the URL already has a query
string) for hosted providers, otherwise Node's `pg` driver will refuse the
connection.

## 2. Apply the migration

From your machine, with the production URL in the environment:

```bash
# PowerShell
$env:DATABASE_URL = "postgresql://..."
npm run db:migrate

# macOS / Linux
DATABASE_URL="postgresql://..." npm run db:migrate
```

`db:migrate` is `prisma migrate deploy`. It applies the SQL in
`prisma/migrations/` in order and records what it applied in Prisma's
`_prisma_migrations` table. It is safe to run on every deploy.

> `prisma migrate deploy` needs a real TCP connection string. It cannot talk to
> the embedded database, which is why local development applies the same SQL
> files itself in `src/lib/db/migrate.ts`.

## 3. Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repository.
3. Framework preset: **Next.js**. Build command `npm run build`, output is
   detected automatically. The `postinstall` script runs `prisma generate`.
4. Add environment variables (**Settings → Environment Variables**):

   | Name | Value | Environments |
   | --- | --- | --- |
   | `DATABASE_URL` | your PostgreSQL URL | Production, Preview, Development |

   That is the only required variable. Leave `SEED_DEMO_DATA` unset so a public
   deployment never creates a shared demo login.

5. Deploy. Vercel runs `npm install` (which generates the Prisma client) and
   `npm run build`, then serves the app.

6. After the first deploy, run the migration once against the production
   database (step 2). Re-run it whenever `prisma/migrations/` gains a folder.

### Optional: seed the demo workspace

If you want the demo account on a hosted database:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

This creates `demo@lifehub.app` with `isDemo = true`, so every screen keeps
labelling the data as sample data. The script refuses to run if the database
already contains other users, which prevents a known password from appearing in
a real workspace.

### Preview deployments

Each Vercel preview gets the same `DATABASE_URL` unless you add a separate
preview database. Sharing one database between previews and production is
confusing because both write real rows; either use a dedicated preview database
or accept that previews are not isolated.

## 4. Docker (alternative)

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

Build it with the database URL available at runtime, not build time:

```bash
docker build -t lifehub .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  lifehub
```

Run `npm run db:migrate` as a one-off task (or an init container) before
starting the app. If you want the embedded mode in a container, mount a volume
at `/app/.data` and keep exactly one replica.

---

## Environment variables

| Variable | Required | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | Production | PostgreSQL connection string. Unset = embedded database. |
| `LIFEHUB_DATA_DIR` | No | Directory for embedded database files (default `.data/pglite`). Ignored when `DATABASE_URL` is set. |
| `SEED_DEMO_DATA` | No | `"true"` seeds the demo account in a production build of the embedded mode. |

Sessions live in the database, so signing out of one device signs out only that
device, and restarting the app does not sign everyone out.

## Health checks

There is no dedicated `/health` route. A signed-out request to `/login` exercises
the database (it checks whether the demo account exists), and any protected page
performs a real query. For an uptime monitor, poll `/login` and treat a 200 as
healthy.

## Troubleshooting

**`Error: P1001: Can't reach database server`**
- Verify the host and port, and that your IP is allowed by the provider.
- Hosted providers usually require `sslmode=require`.
- If the password contains `@`, `:` or `/`, URL-encode it.

**`The table public.users does not exist`**
- Migrations have not run: `npm run db:migrate`.

**`DATABASE_URL must start with postgresql:// or postgres://`**
- A value is set but malformed. An empty string is fine and means "use the
  embedded database".

**`PGlite failed to initialize properly`**
- Another process is already using the same `.data` directory. PGlite is
  single-process: stop the other server, or set `LIFEHUB_DATA_DIR` to a
  different folder.

**Everyone is signed out after a deploy**
- Sessions are rows in the database, not signed tokens, so they survive
  redeploys unless the database was reset. If `DATABASE_URL` changed or points at
  a fresh database, old session rows are gone.
