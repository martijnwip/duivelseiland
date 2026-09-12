---
name: tanstack-start
description: Use when building, debugging, or reviewing TanStack Start React applications, including TanStack Router routing, server functions, environment functions, server routes, middleware, SSR, data loading, authentication, or deployment.
metadata:
  author: FlyingWip
  version: 1.1.0
---

# TanStack Start

TanStack Start is a full-stack React framework built on TanStack Router. It provides file-based, type-safe routing, SSR, streaming, server functions, server routes, middleware, environment-aware code, and deployment through Vinxi/Nitro adapters. This project currently uses `@tanstack/react-start` 1.168.x and TanStack Router 1.170.x; verify the installed versions before relying on version-specific APIs.

## Core rules

- Read the current official Start and Router docs before introducing an API. Start and Router are versioned independently.
- Keep route files focused on route configuration, loaders, actions, and UI. Put reusable server logic in `src/server/` or a feature module.
- Treat every route loader, component, and ordinary imported function as potentially client-bundled unless its environment is explicitly constrained.
- **Server-only code must use an environment function:**
  - `createServerFn()` when browser code may call the function. The implementation executes on the server through a generated RPC endpoint.
  - `createServerOnlyFn()` when the function is only called from server-side code and must never be callable from the client.
  - Never hide server-only behavior (database access, secrets, filesystem, privileged SDKs) in a normal function.
- Validate all client-provided server-function input at the boundary. Prefer Standard Schema-compatible validators such as Zod when validation is needed.
- Never return secrets, password hashes, raw database rows, or privileged request data to the client. Return explicit DTOs.
- Use `getRequestHeaders()`/`getRequestHost()` and server request context inside server functions instead of assuming browser globals.

## Project structure

Typical React Start structure:

```text
src/
  routes/                 # file-based routes; routeTree.gen.ts is generated
    __root.tsx
    api/                   # server routes
  server/                 # server-only modules and integrations
  router.tsx
  styles.css
public/
```

Do not hand-edit `src/routeTree.gen.ts`. Run the configured route generator after adding, deleting, or renaming route files.

## Environment functions

Environment functions are the explicit boundary between client and server execution. They are not merely helpers or annotations: Start transforms them so a client call can cross to the server, while server-only functions remain unavailable to client bundles.

### Client-callable server function

Use `createServerFn()` for mutations and reads initiated by browser code, route loaders, or components:

```ts
import { createServerFn } from "@tanstack/react-start";

export const getProfile = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    // Server execution: query the database and return a safe DTO.
    return { userId: data.userId };
  });
```

Use `method: "GET"` for idempotent reads and `method: "POST"` for mutations. Keep authorization inside the handler or shared server middleware; never rely on UI visibility or route guards alone.

### Server-only function

Use `createServerOnlyFn()` for code that is only used by other server code:

```ts
import { createServerOnlyFn } from "@tanstack/react-start";

export const readSecret = createServerOnlyFn(() => {
  return process.env.INTERNAL_SECRET;
});
```

Use this for database connection factories, filesystem access, secret handling, admin SDKs, and internal server utilities. Do not call it from a component, browser event handler, or client module.

### Rules for both forms

- Keep imports of server-only modules behind the environment-function boundary.
- Do not pass functions, class instances, `Database` handles, `Request` objects, or other non-serializable values as input/return data.
- Keep inputs and outputs serializable and small.
- Use explicit schemas for untrusted input and normalize errors into safe client-facing responses.
- Prefer one server function per meaningful operation over a generic RPC dispatcher.

## Routing and data loading

- Use `createFileRoute()` for route files and typed route params/search params.
- Use route `loader`s for data required to render a route. A loader can call a server function; do not import a database module directly into a route that can be client-bundled.
- Use `beforeLoad` for route-level context and redirects, especially authentication checks. It is not a substitute for authorization in server functions.
- Use `loaderDeps` and validated search params when loader data depends on URL search state.
- Use `staleTime`, preloading, and pending/error components deliberately; avoid accidental duplicate fetching.
- Use `notFound()`/route error boundaries for expected route failures rather than leaking server exceptions.
- Keep route components presentational when possible and use route context for data already loaded by the route.

## Server routes

Use file-based server routes under `src/routes`, for example `src/routes/api/health.ts` or `src/routes/api/auth/$.ts`.

- Export `Route = createFileRoute(...)({ server: { handlers: { ... } } })`.
- Use server routes for webhooks, third-party callbacks, health checks, streaming, and APIs that need direct HTTP control.
- Return `Response` objects with explicit status and headers.
- Authenticate and authorize inside the handler; validate method, headers, content type, and request body.
- Use `createServerFn()` for application operations called from Start code unless direct HTTP semantics are required.

## Middleware and authentication

- Use Start middleware for shared request concerns such as auth/session loading, request IDs, logging, and authorization context.
- Middleware runs in a defined request chain; keep ordering explicit and avoid hidden global state.
- For Better Auth with TanStack Start, mount GET and POST handlers at `/api/auth/$` and include `tanstackStartCookies()` as the final Better Auth plugin.
- Check the session again inside protected server functions/server routes. Client route protection only controls navigation and UX.

## SSR and security

- Server-rendered code still crosses a client/server boundary. Never assume a file is server-only because it is imported by a loader or route.
- Never expose environment variables, database credentials, cookies, internal errors, or secrets through loader data or rendered HTML.
- Prefer request-derived auth/session state over client-submitted user IDs.
- Escape or safely render user-generated content; do not trust post/comment text.
- Make mutations idempotent where practical and enforce invariants in the database as well as application code.

## Deployment and tooling

- Use the official TanStack Start create flow and the deployment adapter appropriate to the target runtime.
- For Bun development and Bun-only modules such as `bun:sqlite`, run through Bun (`bun --bun ...`) so the server runtime is Bun rather than Node.
- Keep generated route files out of manual edits.
- Run route generation, formatting, type checking, and a production build after route or server-boundary changes.

## References

Official documentation used for this skill:

- [TanStack Start getting started](https://tanstack.com/start/latest/docs/framework/react/getting-started)
- [Environment functions](https://tanstack.com/start/latest/docs/framework/react/guide/environment-functions)
- [Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [Server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes)
- [Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [Authentication](https://tanstack.com/start/latest/docs/framework/react/guide/authentication)
- [TanStack Router data loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- [TanStack Router file-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)
- [TanStack Router search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params)
- [TanStack Router authentication](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)
- [Agent Skills specification](https://agentskills.io/specification)
