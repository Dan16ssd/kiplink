import { previewFetch } from "@/lib/preview";

// Preview build (GitHub Pages): no server, no chain. API calls are answered in the browser.
export const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

export function api(path: string, init?: RequestInit): Promise<Response> {
  return PREVIEW ? previewFetch(path, init) : fetch(path, init);
}
