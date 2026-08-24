export function parseUrl(url: string): URL {
  return new URL(url, window.location.origin);
}
