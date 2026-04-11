# UPTIME - منصة أمن الشبكات والوعي السيبراني

## Overview

UPTIME is a full-stack Arabic-language network security and cybersecurity awareness platform. It provides 7 functional security tools in a modern dark-themed RTL interface.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/uptime)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (provisioned but not yet used)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

### 7 Security Tools (Arabic RTL Interface)
1. **تتبع الموقع الجغرافي** (IP/Domain Geolocation) - with Leaflet interactive map
2. **فحص سجلات DNS** - A, MX, TXT records lookup
3. **تحديد المصنّع** (MAC Vendor Lookup) - via macvendors.com API
4. **فحص المنافذ** (Port Scanner) - ports 80, 443, 22, 21
5. **معلومات النطاق** (WHOIS Lookup) - via rdap.org
6. **فحص الشهادة** (SSL Checker) - TLS certificate info
7. **فحص سلامة الروابط** (URL Safety) - heuristic analysis

### UI Features
- Full Dark Mode with 33/33/33 black/gray/white ratio
- Cairo font (Arabic RTL layout)
- Vertical Accordion navigation
- Loading Spinners per tool
- PDF export per tool (via window.print)
- Sticky footer: نعمان الأنصاري، بلال باجرون، إشراف عبد الرحمن المنتشري

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Endpoints

All under `/api/tools/`:
- `GET /api/tools/geoip?target=<ip-or-domain>`
- `GET /api/tools/dns?domain=<domain>`
- `GET /api/tools/mac?mac=<mac-address>`
- `GET /api/tools/portscan?host=<host>`
- `GET /api/tools/whois?domain=<domain>`
- `GET /api/tools/ssl?domain=<domain>`
- `GET /api/tools/urlsafety?url=<url>`

## External APIs Used

- ip-api.com (free, HTTP) - GeoIP lookups
- Native Node.js DNS module - DNS records
- macvendors.com - MAC vendor lookup
- rdap.org - WHOIS/RDAP data
- Native Node.js TLS module - SSL certificate inspection

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
