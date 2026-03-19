# Honora

Generate a complete REST API project from a single JSON schema file.

Define your collections in `schema.json`, run `honora`, and get a ready-to-run project with CRUD endpoints, validation, pagination, filtering, and sorting. No runtime dependency on honora — it generates plain source code you own.

## Quick Start

```bash
npx honora my-api
cd my-api
npm install
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
honora my-api --schema ./schema.json
```

## CLI Usage

```
honora <name> [options]
```

| Argument / Option | Description                                    |
| ----------------- | ---------------------------------------------- |
| `<name>`          | Project name or `.` for current directory      |
| `--schema <path>` | Path to schema file (default: `./schema.json`) |
| `--lang <ts\|js>` | Output language (default: `ts`)                |
| `--force`         | Overwrite existing directory                   |
| `--yes`           | Skip prompts, use defaults                     |
| `--help`          | Show help                                      |
| `--version`       | Show version                                   |

Without flags, honora runs interactively and prompts for each option.

## Generated Project

```
my-api/
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

## License

[MIT](LICENSE)