const BASE = "";

function userParam(user: string | null): string {
  return user ? `?user=${encodeURIComponent(user)}` : "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  getUsers: () => request<{ users: string[] }>("/api/users"),

  createUser: (name: string) =>
    request<{ name: string }>("/api/users", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getRoutes: (user: string) =>
    request<Route[]>(`/api/routes${userParam(user)}`),

  addRoute: (user: string, route: Route) =>
    request<{ success: boolean }>(`/api/routes${userParam(user)}`, {
      method: "POST",
      body: JSON.stringify(route),
    }),

  deleteRoute: (user: string, id: string) =>
    request<{ success: boolean }>(`/api/routes/${id}${userParam(user)}`, {
      method: "DELETE",
    }),

  scrapeLine: (masterUrl: string) =>
    request<LineMetadata>("/api/scrape-line", {
      method: "POST",
      body: JSON.stringify({ masterUrl }),
    }),

  scrapeTimes: (user: string, routeId: string) =>
    request<{ busTimes: string[]; timestamp: number }>(
      `/api/scrape-times/${routeId}${userParam(user)}`,
      { method: "POST" }
    ),

  getNextBus: (routeId: string) =>
    request<NextBusResponse>(`/api/next-bus/${routeId}`),

  getLogs: (routeId: string) =>
    request<LogEntry[]>(`/api/logs/${routeId}`),
};

// Re-export types used by the frontend
export interface Route {
  id: string;
  routeNumber: string;
  direction: "dus" | "intors";
  stationName: string;
  stationSlug: string;
  url: string;
  directionFrom?: string;
  directionTo?: string;
  cachedBusTimes?: string[];
  cacheTimestamp?: number;
}

export interface StationData {
  route: string;
  name: string;
  link: string;
}

export interface LineMetadata {
  lineName: string;
  stations: StationData[];
}

export interface NextBusResponse {
  next: string | null;
  in_minutes: number | null;
  station: string;
  route: string;
}

export interface LogEntry {
  timestamp: number;
  busTimes: string[];
}
