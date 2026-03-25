# Honora

Generate a complete REST API project from a single JSON schema file.

Define your collections in `schema.json`, run `create-honora`, and get a ready-to-run project with CRUD endpoints, validation, pagination, filtering, and sorting. No runtime dependency on honora — it generates plain source code you own.

## Quick Start

```bash
npx create-honora my-api
cd my-api
npx drizzle-kit push
npm run dev
```

Your API is running at `http://localhost:3000`.

## Schema

Create a `schema.json` in your working directory:

```json
{
  "database": {
    "driver": "sqlite",
    "url": "./data.db"
  },
  "middleware": ["cors", "logger"],
  "validation": "hono-zod",
  "openapi": true,
  "collections": [
    {
      "name": "users",
      "id": { "type": "uuid" },
      "fields": {
        "name": { "type": "text", "required": true },
        "email": { "type": "text", "required": true, "unique": true },
        "age": { "type": "integer", "min": 0, "max": 150 },
        "is_active": { "type": "boolean", "default": true },
        "profile": { "type": "json" }
      }
    },
    {
      "name": "posts",
      "id": { "type": "uuid" },
      "fields": {
        "user_id": {
          "type": "relation",
          "collection": "users",
          "required": true,
          "onDelete": "cascade"
        },
        "title": { "type": "text", "required": true },
        "body": { "type": "text", "required": true },
        "published_at": { "type": "date" },
        "views": { "type": "integer", "default": 0 }
      }
    }
  ]
}
```

Then run:

```bash
npx create-honora my-api --schema ./schema.json
```

## CLI Usage

```
create-honora <name> [options]
```

| Argument / Option        | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `<name>`                 | Project name or `.` for current directory      |
| `--schema <path>`        | Path to schema file (default: `./schema.json`) |
| `--lang <ts\|js>`        | Output language (default: `ts`)                |
| `--driver <driver>`      | Database: `sqlite`, `postgres`, `mysql`        |
| `--middleware <list>`    | Comma-separated: `cors`, `logger`              |
| `--validation <mode>`    | Validation: `manual`, `hono-zod`               |
| `--openapi`              | Enable OpenAPI docs with Scalar UI             |
| `--force`                | Overwrite existing directory                   |
| `--git` / `--no-git`     | Initialize git repository (default: yes)       |
| `--install` / `--no-install` | Install dependencies (default: yes)        |
| `--pkg-manager <pm>`     | Package manager: `npm`, `pnpm`, `yarn`, `bun`  |
| `--yes`                  | Skip prompts, use defaults                     |
| `--help`                 | Show help                                      |
| `--version`              | Show version                                   |

Without flags, honora runs interactively and prompts for each option.

### Examples

```bash
# Interactive (prompts for everything)
npx create-honora my-api

# Non-interactive with all options
npx create-honora my-api --schema ./schema.json --lang ts --driver postgres \
  --middleware cors,logger --validation hono-zod --openapi --yes

# Generate in current directory
npx create-honora . --yes --force

# TypeScript + PostgreSQL with Zod validator
npx create-honora my-api --lang ts --driver postgres --validation hono-zod

# Skip git and install
npx create-honora my-api --no-git --no-install
```

## Generated Project

```
my-api/
  .gitignore
  package.json
  tsconfig.json
  drizzle.config.ts
  schema.json
  src/
    index.ts              # Hono server entry
    db/
      schema.ts           # Drizzle ORM table definitions
      client.ts           # Database connection
    routes/
      index.ts            # Route mounting
      users.ts            # CRUD for users
      posts.ts            # CRUD for posts
    utils/
      filter-parser.ts    # Query filter parser
```

### Generated Scripts

```bash
npm run dev           # Start dev server (with watch)
npm run build         # Build for production
npm start             # Run production build
npm run db:generate   # Generate migration files
npm run db:migrate    # Run migrations
npm run db:push       # Push schema directly (dev)
npm run db:studio     # Open Drizzle Studio
```

## API Endpoints

All collection endpoints are under `/api`:

| Method   | Path                   | Description              |
| -------- | ---------------------- | ------------------------ |
| `GET`    | `/api/_health`         | Health check             |
| `GET`    | `/api/:collection`     | List records (paginated) |
| `GET`    | `/api/:collection/:id` | Get single record        |
| `POST`   | `/api/:collection`     | Create record            |
| `PATCH`  | `/api/:collection/:id` | Update record            |
| `DELETE` | `/api/:collection/:id` | Delete record            |

### Pagination & Sorting

```bash
# Paginate
GET /api/users?page=2&perPage=10

# Sort (prefix with - for descending)
GET /api/users?sort=-created_at

# Filter
GET /api/users?filter=age>18
```

List responses:

```json
{
  "page": 1,
  "perPage": 20,
  "totalPages": 1,
  "totalItems": 1,
  "items": [...]
}
```

### Error Responses

```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "Required" }]
  }
}
```

| Code  | Meaning                           |
| ----- | --------------------------------- |
| `400` | Validation error or invalid input |
| `404` | Record not found                  |
| `409` | Unique constraint violation       |

## Field Types

| Type       | Description     | Options                  |
| ---------- | --------------- | ------------------------ |
| `text`     | String          | `min`, `max`, `unique`   |
| `number`   | Float           | `min`, `max`             |
| `integer`  | Integer         | `min`, `max`             |
| `boolean`  | Boolean         | `default`                |
| `date`     | ISO date string |                          |
| `json`     | JSON object     |                          |
| `relation` | Foreign key     | `collection`, `onDelete` |

### ID Types

Each collection can specify its ID strategy:

```json
{ "id": { "type": "uuid" } }
{ "id": { "type": "integer", "autoincrement": true } }
{ "id": { "type": "text" } }
```

| Type                      | Behavior                                  |
| ------------------------- | ----------------------------------------- |
| `uuid` (default)          | Auto-generated with `crypto.randomUUID()` |
| `integer` + autoincrement | Auto-generated by database                |
| `integer`                 | User must provide in request body         |
| `text`                    | User must provide in request body         |

### Relations

```json
{
  "user_id": {
    "type": "relation",
    "collection": "users",
    "required": true,
    "onDelete": "cascade"
  }
}
```

`onDelete` options: `restrict` (default), `cascade`, `set_null`.

### System Columns

Every collection automatically includes:

- `id` — primary key (configurable type)
- `created_at` — ISO timestamp, set on creation
- `updated_at` — ISO timestamp, updated on every change

## Optional Features

### Database Drivers

By default, projects use **SQLite**. You can choose PostgreSQL or MySQL:

```json
{
  "database": {
    "driver": "postgres",
    "url": "postgresql://user:password@localhost:5432/mydb"
  }
}
```

Supported: `sqlite`, `postgres`, `mysql`

### Middleware

Enable built-in Hono middleware:

```json
{
  "middleware": ["cors", "logger"]
}
```

- **CORS**: Cross-Origin Resource Sharing
- **Logger**: HTTP request logging

Use the `--middleware` flag to override: `--middleware cors,logger`

### Validation

Choose validation strategy for request bodies:

```json
{
  "validation": "hono-zod"
}
```

- **`manual` (default)**: Use `safeParse()` for validation, manual error formatting
- **`hono-zod`**: Use `@hono/zod-validator` middleware for cleaner routes

Use the `--validation` flag to override: `--validation hono-zod`

### OpenAPI Documentation

Enable interactive API documentation with Scalar UI:

```json
{
  "openapi": true
}
```

When enabled:
- `GET /api/doc` returns the OpenAPI 3.1.0 JSON spec
- `GET /api/docs` serves the **Scalar UI** for interactive exploration
- Routes use `@hono/zod-openapi` with typed `createRoute()` definitions
- Validation is automatically set to `hono-zod`
- All schemas, request bodies, and responses are documented

Use the `--openapi` flag to enable: `--openapi`

## License

[MIT](LICENSE)
