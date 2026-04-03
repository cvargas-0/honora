# Honora

A monorepo for **Honora**, a REST API code generator that scaffolds complete, production-ready Hono projects from a single JSON schema file.

Define your data model in `schema.json`, run `create-honora`, and get a full project with CRUD endpoints, pagination, filtering, sorting, validation, and optional OpenAPI documentation. **No runtime dependency** — you own the generated code.

## Quick Start

```bash
# npm
npx create-honora@latest my-api

# pnpm
pnpm create honora@latest my-api

# bun
bun create honora@latest my-api
```

## Monorepo Structure

```
honora/
├── apps/
│   └── cli/                     # create-honora CLI tool
│       └── README.md            # CLI usage & options
├── packages/
│   ├── types/                   # @honora/types — shared TypeScript schemas
│   └── generator/               # @honora/generator — code generation engine
└── README.md                    # This file
```

### [`apps/cli`](apps/cli) — Create Honora CLI

The user-facing CLI tool. Interactive or non-interactive project scaffolding with schema validation, option prompts, and file generation.

- **Published as**: `create-honora`
- **Entry point**: `npx create-honora@latest <project-name>`
- **See**: [apps/cli/README.md](apps/cli/README.md) for full CLI usage and examples

### [`packages/types`](packages/types) — @honora/types

TypeScript types and Zod schemas for the Honora ecosystem. Defines the contract for project schemas, field types, and validation rules.

- **Published as**: `@honora/types`
- **Exports**: Core types, schema validators, and adapter interfaces
- **Used by**: Generator, CLI, and generated projects

### [`packages/generator`](packages/generator) — @honora/generator

Core code generation engine. Takes a validated schema and context, renders Handlebars templates, and writes project files.

- **Published as**: `@honora/generator`
- **Key responsibility**: Schema → file generation logic
- **Features**: Multi-language output (TS/JS), multi-driver support (SQLite/PostgreSQL/MySQL), optional middleware & validation

## Development

### Prerequisites

- **Node.js**: 22.17.1+
- **pnpm**: 10.6.5+

### Setup

```bash
git clone https://github.com/cvargas-0/honora
cd honora
pnpm install
```

### Build All Packages

```bash
pnpm build
```

### Build Specific Package

```bash
pnpm -F @honora/types build
pnpm -F @honora/generator build
pnpm -F create-honora build
```

### Watch Mode

```bash
pnpm -F @honora/types dev
pnpm -F @honora/generator dev
pnpm -F create-honora dev
```

### Type Checking

```bash
pnpm -r typecheck
```

### Test Generated Projects

```bash
node apps/cli/dist/cli.js my-test-api --yes
cd my-test-api
pnpm install
pnpm run dev
```

## Architecture Overview

**Honora** works in three phases:

1. **Schema Validation** (types package)
   - User provides `schema.json`
   - Zod validators ensure structure & constraints

2. **Code Generation** (generator package)
   - Build `GeneratorContext` (lang, driver, middleware, validation mode)
   - Render Handlebars templates with context
   - Generate project structure: database schema, CRUD routes, config files

3. **Project Scaffolding** (CLI)
   - Interactive or non-interactive prompts
   - Call generator
   - Install dependencies, initialize git

## Features

- **Multi-language**: TypeScript or JavaScript output
- **Multi-database**: SQLite, PostgreSQL, MySQL support
- **CRUD Endpoints**: Full RESTful API with pagination, sorting, filtering
- **Validation**: Manual or automatic (Zod-based)
- **Middleware**: Optional CORS, logging
- **OpenAPI**: Generate interactive documentation with Scalar UI
- **Database Schema**: Drizzle ORM table definitions and migrations
- **Zero Runtime Dependency**: Generated code is yours — no honora required

## Common Development Tasks

### Add a New Field Type

1. Update schema definition in `packages/types`
2. Add Drizzle column expression in `packages/generator` (all drivers)
3. Add Zod validation in `packages/generator`
4. Update templates if needed

### Add a New Database Driver

1. Extend schema validation in `packages/types`
2. Add driver detection & imports in `packages/generator`
3. Update DB schema and client templates
4. Add error handling for driver-specific error codes
5. Update dependencies in CLI

### Test CLI Changes

```bash
pnpm -F create-honora build
node apps/cli/dist/cli.js test-project --force --yes
```

## Contributing

Honora is open source. Contributions welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

Build with ❤️ by [Camilo Vargas](https://cvargas.dev)
