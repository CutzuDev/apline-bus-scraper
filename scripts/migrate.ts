import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Route, UsersFile, LogEntry } from "../server/lib/types";

const ROOT = join(import.meta.dir, "..");
const OLD_ROUTES = join(ROOT, "routes.json");
const DATA_DIR = join(ROOT, "data");
const USERS_FILE = join(DATA_DIR, "users.json");
const LOGS_DIR = join(DATA_DIR, "logs");

async function migrate() {
  console.log("Starting migration...");

  // Ensure directories
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(LOGS_DIR, { recursive: true });

  // Read old routes
  let oldRoutes: Route[] = [];
  try {
    const raw = await readFile(OLD_ROUTES, "utf-8");
    oldRoutes = JSON.parse(raw);
    console.log(`Found ${oldRoutes.length} existing routes`);
  } catch {
    console.log("No existing routes.json found, creating empty user");
  }

  // Create default user with all existing routes
  const usersData: UsersFile = {
    users: [
      {
        name: "Admin",
        routes: oldRoutes,
      },
    ],
  };

  await writeFile(USERS_FILE, JSON.stringify(usersData, null, 2));
  console.log(`Created data/users.json with user "Admin" and ${oldRoutes.length} routes`);

  // Seed log files from cached data
  let logCount = 0;
  for (const route of oldRoutes) {
    if (route.cachedBusTimes && route.cacheTimestamp) {
      const entry: LogEntry = {
        timestamp: route.cacheTimestamp,
        busTimes: route.cachedBusTimes,
      };
      const logPath = join(LOGS_DIR, `${route.id}.json`);
      await writeFile(logPath, JSON.stringify([entry], null, 2));
      logCount++;
    }
  }

  console.log(`Created ${logCount} log files in data/logs/`);
  console.log("Migration complete.");
}

migrate().catch(console.error);
