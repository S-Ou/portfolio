import process from "node:process";

const apiKey = process.env.MARVEL_RIVALS_API_KEY?.trim();
const playerUid =
  process.env.MARVEL_RIVALS_UID?.trim() ||
  process.env.MARVEL_RIVALS_PLAYER?.trim();

if (!apiKey) {
  console.error("Missing MARVEL_RIVALS_API_KEY");
  process.exit(1);
}

if (!playerUid) {
  console.error("Missing MARVEL_RIVALS_UID (or MARVEL_RIVALS_PLAYER fallback)");
  process.exit(1);
}

const url = `https://marvelrivalsapi.com/api/v1/player/${encodeURIComponent(playerUid)}/update`;
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 20_000);

try {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
      "user-agent": "portfolio-marvel-rivals-updater/1.0",
    },
    signal: controller.signal,
  });

  const body = await response.text();
  console.log("status:", response.status);
  console.log("body:", body.slice(0, 1000));

  if (!response.ok) {
    process.exit(1);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("request failed:", message);
  process.exit(1);
} finally {
  clearTimeout(timeout);
}
