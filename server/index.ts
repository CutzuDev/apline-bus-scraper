import { join } from "path";
import { stat } from "fs/promises";
import { ensureDataDir } from "./lib/store";
import { loadLog } from "./lib/store";
import { handleUsers } from "./routes/users";
import { handleRoutes } from "./routes/routes";
import { handleScraper } from "./routes/scraper";
import { handleNextBus } from "./routes/nextBus";
import { handleMapRoute } from "./routes/mapRoute";

const DIST_DIR = join(import.meta.dir, "../dist");
const PORT = 4200;

await ensureDataDir();

async function serveStatic(pathname: string): Promise<Response | null> {
  const filePath = join(DIST_DIR, pathname);

  try {
    const info = await stat(filePath);
    if (info.isFile()) {
      return new Response(Bun.file(filePath));
    }
  } catch {
    // File doesn't exist, fall through
  }

  return null;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // API routing
    if (url.pathname.startsWith("/api/")) {
      const response =
        (await handleUsers(req, url)) ??
        (await handleRoutes(req, url)) ??
        (await handleScraper(req, url)) ??
        (await handleNextBus(req, url)) ??
        (await handleMapRoute(req, url));

      // Logs endpoint
      if (!response && url.pathname.startsWith("/api/logs/") && req.method === "GET") {
        const routeId = url.pathname.split("/api/logs/")[1];
        const entries = await loadLog(routeId);
        return Response.json(entries);
      }

      if (response) return response;

      return Response.json({ message: "Endpoint negasit" }, { status: 404 });
    }

    // Static file serving (production)
    const staticResponse = await serveStatic(url.pathname);
    if (staticResponse) return staticResponse;

    // SPA fallback: serve index.html for all non-API, non-file routes
    const indexPath = join(DIST_DIR, "index.html");
    try {
      return new Response(Bun.file(indexPath));
    } catch {
      return new Response("Frontend not built. Run: bun run build", {
        status: 503,
      });
    }
  },
});

console.log(`[server] Running on http://localhost:${server.port}`);
