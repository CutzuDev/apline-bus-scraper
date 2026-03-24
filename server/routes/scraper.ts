import { scrapeLineMetadata, scrapeBusTimes } from "../lib/scraper";
import { getUser, saveUser, appendLog } from "../lib/store";

export async function handleScraper(req: Request, url: URL): Promise<Response | null> {
  const method = req.method;

  if (url.pathname === "/api/scrape-line" && method === "POST") {
    const { masterUrl } = await req.json() as { masterUrl: string };
    if (!masterUrl) {
      return Response.json({ message: "masterUrl este obligatoriu" }, { status: 400 });
    }

    try {
      console.log(`[scraper] Scraping line metadata: ${masterUrl}`);
      const metadata = await scrapeLineMetadata(masterUrl);
      console.log(`[scraper] Found: ${metadata.lineName} - ${metadata.stations.length} statii`);
      return Response.json(metadata);
    } catch (error) {
      console.error("[scraper] Error scraping line metadata:", error);
      return Response.json(
        {
          message: "Eroare la scanarea liniei",
          error: error instanceof Error ? error.message : "Eroare necunoscuta",
        },
        { status: 500 }
      );
    }
  }

  if (url.pathname.startsWith("/api/scrape-times/") && method === "POST") {
    const routeId = url.pathname.split("/api/scrape-times/")[1];
    const userName = url.searchParams.get("user");

    if (!userName) {
      return Response.json({ message: "Parametrul ?user= este obligatoriu" }, { status: 400 });
    }

    const user = await getUser(userName);
    if (!user) {
      return Response.json({ message: "Utilizatorul nu a fost gasit" }, { status: 404 });
    }

    const route = user.routes.find((r) => r.id === routeId);
    if (!route) {
      return Response.json({ message: "Ruta nu a fost gasita" }, { status: 404 });
    }

    try {
      console.log(`[scraper] Scraping bus times for: ${route.routeNumber} ${route.direction} - ${route.stationName}`);
      const busTimes = await scrapeBusTimes(route.url);
      const timestamp = Date.now();

      route.cachedBusTimes = busTimes;
      route.cacheTimestamp = timestamp;
      await saveUser(user);

      await appendLog(routeId, { timestamp, busTimes });

      console.log(`[scraper] Scraped ${busTimes.length} times, logged`);
      return Response.json({ busTimes, timestamp });
    } catch (error) {
      console.error("[scraper] Error scraping bus times:", error);
      return Response.json(
        {
          message: "Eroare la scanarea timpilor",
          error: error instanceof Error ? error.message : "Eroare necunoscuta",
        },
        { status: 500 }
      );
    }
  }

  return null;
}
