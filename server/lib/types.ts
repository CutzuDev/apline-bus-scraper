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

export interface User {
  name: string;
  routes: Route[];
}

export interface UsersFile {
  users: User[];
}

export interface LogEntry {
  timestamp: number;
  busTimes: string[];
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
