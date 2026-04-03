# create-honora

```
 ██╗  ██╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗  █████╗
 ██║  ██║██╔═══██╗████╗  ██║██╔═══██╗██╔══██╗██╔══██╗
 ███████║██║   ██║██╔██╗ ██║██║   ██║██████╔╝███████║
 ██╔══██║██║   ██║██║╚██╗██║██║   ██║██╔══██╗██╔══██║
 ██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝██║  ██║██║  ██║
 ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

Generate a complete REST API project from a single JSON schema file.

```bash
# npm
npx create-honora@latest my-api

# pnpm
pnpm create honora@latest my-api

# bun
bun create honora@latest my-api
```

## What it does

Define your data model in `schema.json`, run `create-honora`, and get a ready-to-run [Hono](https://hono.dev) project with:

- Full CRUD endpoints for every collection
- Pagination, sorting, and filtering built-in
- Database schema and client ([Drizzle ORM](https://orm.drizzle.team) or [Prisma](https://prisma.io))
- Zod validation
- Optional middleware: CORS, Logger
- Optional OpenAPI documentation with [Scalar UI](https://scalar.com)
- SQLite, PostgreSQL, or MySQL support
- TypeScript or JavaScript output

No runtime dependency on honora — you own the generated code.

## Quick Start

```bash
npx create-honora@latest my-api
cd my-api
npm install
npm run dev
```

Your API will be running at `http://localhost:3000`.

## Schema

Create a `schema.json` in your working directory to define your project:

```json
{
  "database": { "driver": "sqlite", "url": "./data.db" },
  "middleware": ["cors", "logger"],
  "validation": "hono-zod",
  "openapi": true,
  "collections": [
    {
      "name": "users",
      "fields": {
        "name": { "type": "text", "required": true },
        "email": { "type": "text", "required": true, "unique": true },
        "age": { "type": "integer", "min": 0 }
      }
    },
    {
      "name": "posts",
      "fields": {
        "title": { "type": "text", "required": true },
        "body": { "type": "text" },
        "author_id": {
          "type": "relation",
          "collection": "users",
          "required": true
        }
      }
    }
  ]
}
```

Then scaffold:

```bash
npx create-honora my-api --schema ./schema.json
```

**The schema is the contract.** Any property defined in `schema.json` is used as-is. The CLI only prompts for options that are missing.

## Options

| Option                       | Description                                    |
| ---------------------------- | ---------------------------------------------- |
| `--schema <path>`            | Path to schema file (default: `./schema.json`) |
| `--lang <ts\|js>`            | Output language (default: `ts`)                |
| `--driver <driver>`          | Database: `sqlite`, `postgres`, `mysql`        |
| `--orm <orm>`                | ORM: `drizzle`, `prisma`                       |
| `--middleware <list>`        | Comma-separated: `cors,logger`                 |
| `--validation <mode>`        | Validation: `manual`, `hono-zod`               |
| `--openapi`                  | Enable OpenAPI docs with Scalar UI             |
| `--force`                    | Overwrite existing directory                   |
| `--git` / `--no-git`         | Initialize a git repository                    |
| `--install` / `--no-install` | Install dependencies after generation          |
| `--pkg-manager <pm>`         | Package manager: `npm`, `pnpm`, `yarn`, `bun`  |
| `--yes`                      | Skip all prompts, use schema + defaults        |

## Generated Project

```
my-api/
├── package.json
├── tsconfig.json
├── drizzle.config.ts       # or prisma/schema.prisma
├── schema.json
└── src/
    ├── index.ts            # Hono server
    ├── db/
    │   ├── schema.ts       # Table definitions
    │   └── client.ts       # Database connection
    ├── routes/
    │   ├── index.ts        # Route mounting
    │   ├── users.ts        # CRUD for users
    │   └── posts.ts        # CRUD for posts
    └── utils/
        └── filter-parser.ts
```

### Generated scripts

```bash
npm run dev          # Start dev server with watch
npm run build        # Build for production
npm start            # Run production build
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly (dev)
npm run db:studio    # Open DB studio
```

## API Endpoints

All routes are mounted under `/api`:

```
GET    /api/_health
GET    /api/users?page=1&perPage=20&sort=-created_at&filter=age>18
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

When `openapi: true`, an interactive UI is available at `/api/docs`.

## Field Types

| Type       | Description       | Options                              |
| ---------- | ----------------- | ------------------------------------ |
| `text`     | String            | `required`, `unique`, `min`, `max`   |
| `number`   | Float             | `required`, `min`, `max`             |
| `integer`  | Integer           | `required`, `min`, `max`             |
| `boolean`  | Boolean           | `required`, `default`                |
| `date`     | ISO date/datetime | `required`                           |
| `json`     | Any JSON value    | `required`                           |
| `relation` | Foreign key       | `collection`, `required`, `onDelete` |

## License

[MIT](https://github.com/cvargas-0/honora/blob/main/LICENSE)

Build with ❤️ by [Camilo Vargas](https://cvargas.dev)
