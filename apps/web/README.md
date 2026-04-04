# Honora Schema Builder

A visual web interface for designing REST API schemas for [Honora](https://github.com/cvargas-0/honora). Build complete API projects from a single JSON schema without writing code.

## Features

- **Visual Schema Designer** — Intuitive form-based interface for defining collections, fields, and relationships
- **Real-time JSON Preview** — See your schema.json update live as you edit
- **Database Configuration** — Choose between SQLite, PostgreSQL, or MySQL with full configuration
- **Middleware & Options** — Enable CORS, logging, validation, and OpenAPI documentation
- **CLI Command Generator** — Generate ready-to-run CLI commands with one click
- **Light/Dark Mode** — Theme toggle with keyboard shortcut (press `D`)
- **Mobile-Responsive** — Works seamlessly on desktop and mobile devices
- **Import/Export** — Load existing schemas or export your configuration

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start designing your API schema.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **Components:** Base UI + shadcn/ui
- **Animations:** Motion v12
- **Theme:** next-themes for light/dark mode
- **Validation:** Zod

## Keyboard Shortcuts

- **D** — Toggle between light and dark theme
- **Escape** — Cancel editing inline fields
- **Enter** — Confirm changes in text inputs

## Development

The schema builder provides real-time validation and generates the exact `schema.json` format expected by the Honora CLI:

```bash
npx create-honora <project-name> --schema schema.json
```

All configuration (database driver, middleware, OpenAPI) is embedded in the JSON and read by the CLI — no need for separate flags.

## Learn More

- [Honora Documentation](https://github.com/cvargas-0/honora) — Learn about the API generator
- [Next.js Docs](https://nextjs.org/docs) — Next.js features and deployment
