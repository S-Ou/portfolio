# Sam's portfolio website

Hosted on [sjou.dev](https://sjou.dev) and [rocked03.dev](https://rocked03.dev).

## Local development

Install dependencies:

```bash
pnpm install
```

Run the default site:

```bash
pnpm dev
```

Run the SJOu variant:

```bash
pnpm dev:sjou
```

Run the Rocked03 variant:

```bash
pnpm dev:rocked03
```

These scripts set `NEXT_PUBLIC_SITE` to choose which site variant is served.

## Discord server widget API

Endpoint: `/api/discord/server`

Returns cached Discord guild info for guild `281648235557421056` (name, icon, banner/splash, member and online counts).

Setup (`.env.local`):

```bash
DISCORD_BOT_TOKEN=your_bot_token
```

Notes:

- Token is server-only (env var only).
- Endpoint is GET-only.
- Response cache TTL is 1 hour (in-memory).

## Marvel Rivals operations

Use `pnpm marvel:update-player` to call `GET /api/v1/player/{uid}/update`.

`uid` is read from `MARVEL_RIVALS_UID` (preferred) with `MARVEL_RIVALS_PLAYER` as a fallback.

The scheduled workflow in `.github/workflows/marvel-rivals-update-player.yml` runs at `03:16 UTC` and `15:16 UTC` using these repo secrets:

- `MARVEL_RIVALS_API_KEY`
- `MARVEL_RIVALS_UID`

## Marvel Rivals cache

Redis is used when configured; otherwise the app falls back to in-memory cache.

Environment:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `MARVEL_RIVALS_CACHE_PREFIX` (optional, default: `mr:shared`)

Behavior:

- Current season snapshot TTL is 4 hours.
- Historical season snapshots and hero catalog entries are stored without expiry.
- Hero metadata enrichment via per-hero endpoint is always enabled.