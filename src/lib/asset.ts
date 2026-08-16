/** Prefix public URLs with the Vite base path (needed on GitHub Pages). */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export function assets<T extends Record<string, string>>(urls: T): { [K in keyof T]: string } {
  return Object.fromEntries(Object.entries(urls).map(([key, value]) => [key, asset(value)])) as {
    [K in keyof T]: string;
  };
}
