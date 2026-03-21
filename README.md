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