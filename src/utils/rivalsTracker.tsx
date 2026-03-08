export async function getPlayerStats(username: string) {
  const response = await fetch(
    `https://public-api.tracker.gg/v2/marvel-rivals/standard/profile/ign/${username}`,
    {
      headers: {
        "TRN-Api-Key": process.env.TRN_API_KEY ?? "",
      },
    },
  );

  const data = await response.json();
  return data;
}
