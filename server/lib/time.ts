export function nowBucharest(): Date {
  const str = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Bucharest",
  });
  return new Date(str);
}

export function getNextBus(
  busTimes: string[]
): { next: string | null; inMinutes: number | null } {
  const now = nowBucharest();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const time of busTimes) {
    const [h, m] = time.split(":").map(Number);
    const busMinutes = h * 60 + m;
    if (busMinutes > currentMinutes) {
      return { next: time, inMinutes: busMinutes - currentMinutes };
    }
  }

  return { next: null, inMinutes: null };
}
