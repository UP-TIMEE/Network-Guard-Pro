# UPTIME - منصة أمن الشبكات والوعي السيبراني

## Overview

UPTIME is a full-stack Arabic/English bilingual network security platform. It provides 9 functional tools organized in 3 modules, with a dark-themed RTL/LTR interface and full language switching support.

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
- **Routing**: Wouter (client-side)

## Tools (9 total, organized in 3 modules)

### وحدة التخطيط (Planning Module) — Client-side calculators
1. **حاسبة IPv4** (IP Calculator) - Subnet calculator: network/broadcast/hosts/mask from IP + CIDR
2. **محول CIDR** (CIDR Converter) - Convert between CIDR notation and subnet mask
3. **حاسبة النطاق الترددي** (Bandwidth Calculator) - Data transfer time calculator

### وحدة الفحص (Scan Module) — Backend-powered tools
4. **تحديد الموقع الجغرافي** (IP Geolocation) - via ip-api.com with Leaflet interactive map
5. **فحص سجلات DNS** - A, MX, TXT records via native Node.js DNS
6. **تحديد المصنّع** (MAC Vendor) - via macvendors.com API

### وحدة التحليل (Analysis Module) — Client-side analyzers + backend check
7. **محلل ترويسة الإيميل** (Email Header Analyzer) - Parse routing hops, SPF/DKIM/DMARC, warnings
8. **فحص الروابط العميق** (Deep Link Check) - URL safety: heuristic + pattern analysis
9. **اختبار قوة كلمة المرور** (Password Strength) - Entropy calc, checklist, strong password generator

## UI Features

- **Bilingual**: Arabic (RTL) and English (LTR) with one-click toggle
- **Language persistence**: localStorage key `uptime_lang`
- **Dark Mode**: always-on by default, toggle saves to localStorage key `uptime_dark`
- **Cairo font** for all text (both languages)
- **Vertical Accordion** per module with numbered tools (01-09)
- **PDF export** per tool (via styled window.print)
- **Sticky footer**: نعمان الأنصاري، بلال باجرون، بإشراف المهندس عبد الرحمن المنتشري
- **Responsive**: mobile nav hamburger menu

## Architecture

- `artifacts/uptime/src/contexts/LanguageContext.tsx` — Language + translations (AR/EN)
- `artifacts/uptime/src/components/Header.tsx` — Sticky header with dark mode + lang toggle
- `artifacts/uptime/src/pages/Home.tsx` — Hero + 3 cards
- `artifacts/uptime/src/pages/Tools.tsx` — 3-module accordion tool page
- `artifacts/uptime/src/components/tools/` — All 9 tool components
- `artifacts/api-server/src/routes/tools.ts` — Backend routes for scan module

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

- ip-api.com (free, HTTP only) - GeoIP lookups
- Native Node.js DNS module - DNS records
- macvendors.com HTTPS API - MAC vendor lookup
- rdap.org HTTPS API - WHOIS/RDAP data
- Native Node.js TLS module - SSL certificate inspection

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
