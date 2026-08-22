export function parseShekels(price: string): number {
  const parsed = Number(price.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function shekelsToAgorot(shekels: number): number {
  return Math.round(shekels * 100);
}

export function formatShekels(shekels: number): string {
  return `₪${shekels}`;
}
