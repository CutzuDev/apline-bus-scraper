export function getNextBus(
  busTimes: string[]
): { next: string | null; inMinutes: number | null; index: number } {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" })
  );
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < busTimes.length; i++) {
    const [h, m] = busTimes[i].split(":").map(Number);
    const busMinutes = h * 60 + m;
    if (busMinutes > currentMinutes) {
      return { next: busTimes[i], inMinutes: busMinutes - currentMinutes, index: i };
    }
  }

  return { next: null, inMinutes: null, index: -1 };
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
