import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAP_CACHE_DIR = join(import.meta.dir, "../../data/map-cache");
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface StopPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface MapRouteData {
  polyline: [number, number][];
  stops: StopPoint[];
  relationId: number;
}

async function ensureCacheDir() {
  await mkdir(MAP_CACHE_DIR, { recursive: true });
}

function cacheKey(line: string, direction: string): string {
  return join(MAP_CACHE_DIR, `${line}-${direction}.json`);
}

interface CacheEntry {
  timestamp: number;
  data: MapRouteData;
}

async function readCache(key: string): Promise<MapRouteData | null> {
  try {
    const raw = await readFile(key, "utf-8");
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
  } catch {
    // cache miss
  }
  return null;
}

async function writeCache(key: string, data: MapRouteData): Promise<void> {
  await ensureCacheDir();
  const entry: CacheEntry = { timestamp: Date.now(), data };
  await writeFile(key, JSON.stringify(entry));
}

interface OverpassNode {
  type: "node";
  ref: number;
  role: string;
  lat: number;
  lon: number;
}

interface OverpassWayGeom {
  lat: number;
  lon: number;
}

interface OverpassWay {
  type: "way";
  ref: number;
  role: string;
  geometry: OverpassWayGeom[];
}

type OverpassMember = OverpassNode | OverpassWay;

interface OverpassRelation {
  type: "relation";
  id: number;
  tags: Record<string, string>;
  members: OverpassMember[];
}

interface OverpassNodeElement {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: (OverpassRelation | OverpassNodeElement)[];
}

async function fetchFromOverpass(line: string): Promise<OverpassResponse> {
  const refUpper = line.toUpperCase();
  // Fetch relation geometry + member node tags in one query
  const query = `[out:json][timeout:25];
relation["route"~"^(bus|trolleybus)$"]["ref"~"^${refUpper}$",i](45.58,25.50,45.75,25.70)->.r;
.r out geom;
node(r.r:"stop")->.s1;
node(r.r:"stop_entry_only")->.s2;
node(r.r:"stop_exit_only")->.s3;
node(r.r:"platform")->.s4;
(.s1;.s2;.s3;.s4;);
out;`;

  const response = await fetch("https://overpass.openstreetmap.fr/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  return response.json() as Promise<OverpassResponse>;
}

function pickBestRelation(
  relations: OverpassRelation[],
  direction: string,
  directionFrom?: string,
  directionTo?: string
): OverpassRelation | null {
  if (relations.length === 0) return null;
  if (relations.length === 1) return relations[0];

  // Try to match by from/to tags against stored direction metadata
  if (directionFrom && directionTo) {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fromNorm = normalize(directionFrom);
    const toNorm = normalize(directionTo);

    for (const rel of relations) {
      const relFrom = normalize(rel.tags.from ?? "");
      const relTo = normalize(rel.tags.to ?? "");
      if (relFrom.includes(fromNorm.slice(0, 5)) || relTo.includes(toNorm.slice(0, 5))) {
        return rel;
      }
    }
  }

  // Fall back: "intors" → pick second relation, "dus" → first
  return direction === "intors" ? (relations[1] ?? relations[0]) : relations[0];
}

function extractPolyline(relation: OverpassRelation): [number, number][] {
  const coords: [number, number][] = [];
  for (const member of relation.members) {
    if (member.type === "way" && member.geometry?.length > 0) {
      for (const pt of member.geometry) {
        coords.push([pt.lat, pt.lon]);
      }
    }
  }
  return coords;
}

function extractStops(
  relation: OverpassRelation,
  nodeTagsById: Map<number, Record<string, string>>
): StopPoint[] {
  const stops: StopPoint[] = [];
  const seen = new Set<number>();
  for (const member of relation.members) {
    if (
      member.type === "node" &&
      (member.role === "stop" ||
        member.role === "stop_entry_only" ||
        member.role === "stop_exit_only" ||
        member.role === "platform")
    ) {
      const node = member as OverpassNode;
      if (seen.has(node.ref)) continue;
      seen.add(node.ref);
      const tags = nodeTagsById.get(node.ref) ?? {};
      const name = tags.name ?? tags["name:ro"] ?? "";
      stops.push({ name, lat: node.lat, lng: node.lon });
    }
  }
  return stops;
}

export async function handleMapRoute(
  req: Request,
  url: URL
): Promise<Response | null> {
  if (url.pathname !== "/api/map-route" || req.method !== "GET") return null;

  const line = url.searchParams.get("line");
  const direction = url.searchParams.get("direction") ?? "dus";
  const directionFrom = url.searchParams.get("from") ?? undefined;
  const directionTo = url.searchParams.get("to") ?? undefined;

  if (!line) {
    return Response.json({ error: "Lipseste parametrul line" }, { status: 400 });
  }

  // Check cache
  const cached = await readCache(cacheKey(line, direction));
  if (cached) {
    return Response.json(cached);
  }

  try {
    const overpassData = await fetchFromOverpass(line);

    const relations = overpassData.elements.filter(
      (el) => el.type === "relation"
    ) as OverpassRelation[];

    // Build a map of node id → tags from the separately-fetched node elements
    const nodeTagsById = new Map<number, Record<string, string>>();
    for (const el of overpassData.elements) {
      if (el.type === "node") {
        const n = el as OverpassNodeElement;
        if (n.tags) nodeTagsById.set(n.id, n.tags);
      }
    }

    const relation = pickBestRelation(relations, direction, directionFrom, directionTo);
    if (!relation) {
      return Response.json({ error: "Ruta negasita in OpenStreetMap" }, { status: 404 });
    }

    const polyline = extractPolyline(relation);
    const stops = extractStops(relation, nodeTagsById);

    const data: MapRouteData = {
      polyline,
      stops,
      relationId: relation.id,
    };

    await writeCache(cacheKey(line, direction), data);
    return Response.json(data);
  } catch (err) {
    console.error("[map-route] error:", err);
    return Response.json({ error: "Eroare la incarcarea hartii" }, { status: 500 });
  }
}
