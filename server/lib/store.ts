import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { UsersFile, User, LogEntry } from "./types";

const DATA_DIR = join(import.meta.dir, "../../data");
const USERS_FILE = join(DATA_DIR, "users.json");
const LOGS_DIR = join(DATA_DIR, "logs");

export async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(LOGS_DIR, { recursive: true });
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2));
}

// --- Users ---

export async function loadUsers(): Promise<UsersFile> {
  return readJson<UsersFile>(USERS_FILE, { users: [] });
}

export async function saveUsers(data: UsersFile): Promise<void> {
  await writeJson(USERS_FILE, data);
}

export async function getUserNames(): Promise<string[]> {
  const data = await loadUsers();
  return data.users.map((u) => u.name);
}

export async function getUser(name: string): Promise<User | undefined> {
  const data = await loadUsers();
  return data.users.find((u) => u.name === name);
}

export async function saveUser(user: User): Promise<void> {
  const data = await loadUsers();
  const index = data.users.findIndex((u) => u.name === user.name);
  if (index >= 0) {
    data.users[index] = user;
  } else {
    data.users.push(user);
  }
  await saveUsers(data);
}

// --- Logs ---

function logPath(routeId: string): string {
  return join(LOGS_DIR, `${routeId}.json`);
}

export async function loadLog(routeId: string): Promise<LogEntry[]> {
  return readJson<LogEntry[]>(logPath(routeId), []);
}

export async function appendLog(
  routeId: string,
  entry: LogEntry
): Promise<void> {
  const entries = await loadLog(routeId);
  entries.push(entry);
  await writeJson(logPath(routeId), entries);
}
