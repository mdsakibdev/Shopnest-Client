// Fetch JSON from the server, trying a few times before giving up.
//
// Why: the shop runs on a free database that sometimes needs a few
// seconds to "wake up" on the very first visit. Without a retry,
// that one slow first answer made the shop look empty ("0 products
// found") and the visitor had to reload by hand. With this helper
// the page quietly tries again on its own and the products appear —
// no reload needed.
export async function fetchJsonWithRetry<T>(
  url: string,
  tries = 5
): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return (await res.json()) as T;
      }
      lastError = new Error(`Request failed (${res.status})`);
    } catch (error) {
      lastError = error;
    }

    // Wait a moment before the next try (not after the last one)
    if (attempt < tries) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  throw lastError;
}
