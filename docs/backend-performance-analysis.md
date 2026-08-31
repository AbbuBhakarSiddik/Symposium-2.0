# Backend Performance, API Latency & Scaling Analysis
**Project**: Symposium 2.0  
**Target Concurrency**: ~500 Concurrent Active Users  
**Database**: Supabase PostgreSQL (via Service Role Client)  
**External Integration**: Google Sheets API v4 (JWT Auth)  

---

## 1. Executive Summary & Architecture Overview

Symposium 2.0 is built on **Next.js App Router (React 19 / Server Components & Server Actions)** paired with **Supabase PostgreSQL** for persistent state management and **Google Sheets API (v4)** for real-time registration sync from Google Forms.

### High-Level Architecture Diagram
```
                     +----------------------------------+
                     |  500 Concurrent Clients (Web)    |
                     +----------------------------------+
                                      |
                     [ Cloudflare / Vercel Edge CDN ]
                  (Static Assets + ISR Cache Layer - 5s)
                                      |
                    +------------------------------------+
                    |  Next.js Serverless Runtime        |
                    |  (App Router API & Server Actions) |
                    +------------------------------------+
                        /             |              \
                       /              |               \
          [Supabase PgBouncer]  [In-Memory TTL Cache]  [Browser/Client]
                 |               (Google Sheets 5s)         |
        (PostgreSQL Database)         |             (Client CSV/PDF Blob)
                               (Google Sheets API)
```

---

## 2. API Request Catalog & Optimal Processing Time Budgets (SLA)

Below is the complete inventory of all API routes, server actions, and public pages along with their component-level latency breakdown and target SLA performance budgets under load.

### Complete API & Server Action Performance Inventory

| Endpoint / Action | Method | Source / Target | Avg Overhead (Next.js) | DB Query Time (Supabase) | External API (Google Sheets) | Optimal Target SLA (P95) | Max Allowed Budget (P99) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /` (Home Page) | `GET` | SSR / Next.js | 10 - 20 ms | 15 - 35 ms | 250 - 500 ms (Cached: 0 ms) | **< 60 ms** (Cached) | < 300 ms |
| `GET /api/sheets` | `GET` | API Route | 5 - 10 ms | 10 - 25 ms | 0 ms (In-Memory SWR) | **< 20 ms** | < 50 ms |
| `GET /admin` | `GET` | Auth SSR | 15 - 25 ms | 25 - 50 ms | 0 ms (Cached) | **< 80 ms** | < 200 ms |
| `GET /coordinators` | `GET` | Auth SSR | 15 - 20 ms | 20 - 40 ms | 0 ms | **< 60 ms** | < 150 ms |
| `GET /announcements` | `GET` | Public SSR | 5 - 10 ms | 10 - 20 ms | N/A | **< 30 ms** | < 100 ms |
| `GET /api/announcements`| `GET` | API Route | 3 - 5 ms | 8 - 15 ms | N/A | **< 25 ms** | < 50 ms |
| `POST /api/auth/*` | `POST` | NextAuth | 20 - 30 ms | 30 - 60 ms (Bcrypt cost) | N/A | **< 120 ms** | < 250 ms |
| `createEventAction` | `POST` | Server Action | 10 - 15 ms | 15 - 30 ms | N/A | **< 50 ms** | < 150 ms |
| `updateEventAction` | `POST` | Server Action | 10 - 15 ms | 15 - 30 ms | N/A | **< 50 ms** | < 150 ms |
| `deleteEventAction` | `POST` | Server Action | 10 - 15 ms | 15 - 25 ms | N/A | **< 45 ms** | < 120 ms |
| `createGalleryItemAction`| `POST` | Server Action | 10 - 15 ms | 15 - 25 ms | N/A | **< 45 ms** | < 120 ms |
| `deleteGalleryItemAction`| `POST` | Server Action | 10 - 15 ms | 15 - 25 ms | N/A | **< 45 ms** | < 120 ms |
| `createAnnouncementAction`| `POST`| Server Action | 10 - 15 ms | 15 - 25 ms | N/A | **< 45 ms** | < 120 ms |
| `deleteAnnouncementAction`| `POST`| Server Action | 10 - 15 ms | 15 - 25 ms | N/A | **< 45 ms** | < 120 ms |
| `createResourceAction` | `POST` | Server Action | 10 - 15 ms | 15 - 25 ms | N/A | **< 45 ms** | < 120 ms |
| `deleteResourceAction` | `POST` | Server Action | 10 - 15 ms | 15 - 25 ms | N/A | **< 45 ms** | < 120 ms |
| `updateSiteSettingsAction`| `POST`| Server Action | 10 - 15 ms | 20 - 45 ms | N/A | **< 60 ms** | < 150 ms |
| CSV / Excel Export | `GET` | Client Stream | 0 ms (Client) | N/A | N/A | **< 10 ms** (Client) | < 50 ms |
| PDF Export Generation | `GET/POST`| Node Worker | 30 - 50 ms | 20 - 40 ms | N/A | **< 350 ms** | < 800 ms |

---

## 3. Backend Load Balancing & Concurrency for 500 Active Users

### 3.1 Traffic Volume Calculations
- **Active Concurrent Users**: 500 users
- **Polling Behavior**: Home page / Admin board polls `/api/sheets` every 10 seconds for live registration count updates.
- **Request Rate (RPS)**:
  $$\text{RPS (Polling)} = \frac{500 \text{ users}}{10 \text{ seconds}} = 50 \text{ req/sec}$$
- **Peak Traffic Surge Factor (3x)**: During live event registration openings, peak request throughput reaches **150 to 300 RPS**.

### 3.2 Supabase PostgreSQL Database Connection Scaling
Direct database connection limit in Supabase PostgreSQL standard tier is typically ~60-100 connections. With 500 concurrent users accessing serverless functions, opening direct Postgres connections would instantly exhaust available sockets (`FATAL: sorry, too many clients already`).

#### Required Configuration: Supabase Transaction Pooling (PgBouncer)
1. **Connection Pooling Mode**: **Transaction Pooling** (Port `6543`).
2. **Pool Size Configuration**:
   - `default_pool_size` = **20**
   - `max_client_conn` = **1000**
   - `reserve_pool_size` = **5**
3. **Database Indexing**:
   - Ensure indexed lookups for all frequently filtered columns:
     ```sql
     create index if not exists idx_users_username on users(username);
     create index if not exists idx_gallery_created_at on gallery(created_at desc);
     create index if not exists idx_announcements_created_at on announcements(created_at desc);
     ```

---

## 4. Google Sheets API Accessing & Rate Limiting Strategy

### 4.1 Google Sheets API Quota Limits
Google Sheets API v4 enforces strict quotas:
- **Read Requests**: **60 requests per minute per user per project**
- **Project Total Read Quota**: **300 requests per minute per project**

### 4.2 The Rate Limit Problem
If 500 concurrent users call `/api/sheets` every 10 seconds without caching:
$$\text{Requests to Google Sheets} = \frac{500 \text{ users} \times 60 \text{ sec}}{10 \text{ sec}} = 3,000 \text{ req/min}$$
*Result*: This exceeds the 300 req/min quota by **1000%**, triggering immediate `HTTP 429 Too Many Requests / Quota Exceeded` errors!

### 4.3 Optimal Solution: Server-Side In-Memory SWR (Stale-While-Revalidate) Cache
Implement a 5-second server-side memory cache layer in `lib/googleSheets.ts`:

```typescript
// Optimized In-Memory TTL Cache Pattern for Google Sheets
import { google } from "googleapis";
import { EventConfig } from "./eventsConfig";
import { listEvents } from "./db";

export type LiveCounts = Record<string, number>;

let cachedCountsData: { counts: LiveCounts; isLive: boolean } | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 5000; // 5 seconds TTL cache

export async function getLiveCounts(customEvents?: EventConfig[]): Promise<{ counts: LiveCounts; isLive: boolean }> {
  const events = customEvents || (await listEvents());
  const now = Date.now();

  // Return cached result if fresh (< 5 seconds old)
  if (cachedCountsData && (now - lastFetchTimestamp) < CACHE_TTL_MS) {
    return cachedCountsData;
  }

  // Fetch from Google Sheets API
  try {
    const freshData = await fetchFromGoogleSheetsAPI(events);
    cachedCountsData = freshData;
    lastFetchTimestamp = Date.now();
    return freshData;
  } catch (err) {
    // If API fails or hits rate limit, serve last known good cache gracefully
    if (cachedCountsData) {
      return { ...cachedCountsData, isLive: false };
    }
    return { counts: mockCounts(events), isLive: false };
  }
}
```

#### Quota Impact After Caching:
$$\text{Requests to Google Sheets} = \frac{60 \text{ seconds}}{5 \text{ second TTL}} = \mathbf{12 \text{ requests per minute total!}}$$
- **Quota Reduction**: **99.6% reduction in API calls** (From 3,000 req/min down to 12 req/min).
- **Supports**: Easily handles **10,000+ concurrent users** well within Google's free API tiers.

---

## 5. PDF & CSV Export Download Processing & Compute Optimization

### 5.1 Compute Comparison: Client-Side vs Server-Side Generation

| Strategy | Server CPU Load | Server Memory | Scalability for 500 Users | Latency to User |
| :--- | :--- | :--- | :--- | :--- |
| **Server-Side PDF/CSV** | High (Puppeteer / PDFkit) | High (~150MB per render) | Low (Vercel function timeouts) | 800ms - 3000ms |
| **Client-Side Blob (Current)** | **0% (Zero)** | **0 MB** | **Infinite (100% scalable)** | **< 10ms (Instant)** |

### 5.2 Client-Side CSV Export (Current Implementation)
The current CSV export in `AdminDashboardClient.tsx` uses native DOM `Blob` and URL Object creation:
```typescript
const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
// Initiates direct client browser download with zero server backend load!
```

### 5.3 Server-Side PDF Export Rate Limiting & Queue Strategy
If server-side PDF generation is introduced:
1. **Concurrency Cap**: Limit active PDF renders to a maximum of **3 concurrent tasks** per server instance using p-limit or worker queues.
2. **Streaming PDF Generation**: Stream PDF binary chunks using `ReadableStream` instead of buffering whole PDF documents in server RAM.

---

## 6. Comprehensive Rate Limiting Architecture

To protect the serverless backend, database connections, and auth routes against DDoS or abusive scripts, a tiered sliding-window rate limiter is recommended.

### Rate Limiting Policy Summary

| Route Category | Target Endpoint | Window | Max Allowed Requests | Action on Breach |
| :--- | :--- | :--- | :--- | :--- |
| **Public Live Polling** | `GET /api/sheets` | 1 Minute | 60 Requests / IP | Return HTTP 429 & Cached Data |
| **Authentication** | `POST /api/auth/*` | 15 Minutes | 10 Attempts / IP | Lock IP & Return HTTP 429 |
| **Admin & Actions** | `Server Actions` | 1 Minute | 30 Actions / Session | Return HTTP 429 Warning |
| **Public APIs** | `GET /api/announcements` | 1 Minute | 120 Requests / IP | Return HTTP 429 |
| **File Exports** | Export Endpoints | 1 Minute | 5 Requests / User | Return HTTP 429 |

### Middleware Rate Limiting Pattern (`middleware.ts`)
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-Memory sliding window rate limiter (or Upstash Redis for distributed deployments)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "anonymous";
  const path = request.nextUrl.pathname;

  if (path.startsWith("/api/sheets")) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 60;

    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  return NextResponse.next();
}
```

---

## 7. Operational Monitoring & Health Checklist

To maintain optimal SLAs under peak 500-user loads, track the following metrics in your monitoring dashboard (Vercel Analytics / Datadog / Supabase Metrics):

1. **TTFB (Time to First Byte)**: Maintain **< 100ms** across all static/ISR routes.
2. **P95 Latency**: Keep API route responses under **50ms**.
3. **Database Pool Health**: Monitor PgBouncer active client connections (Keep below 80% of max pool size).
4. **Google Sheets Error Counter**: Alarm if `HTTP 429` errors > 0 (indicates cache bypass or invalid credentials).
5. **Memory Usage**: Monitor Node.js heap allocation to stay below **256MB** per serverless instance.
