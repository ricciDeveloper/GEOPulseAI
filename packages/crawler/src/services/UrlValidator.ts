export interface UrlValidationResult {
  isValid: boolean;
  statusCode: number | null;
  error?: string;
}

const TIMEOUT_MS = 8_000;
const BOT_HEADERS = {
  'User-Agent': 'GeoPulse-Bot/1.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

export class UrlValidator {
  /**
   * Validates that a URL is reachable and returns HTTP 200.
   *
   * Strategy:
   *  1. Attempt a HEAD request (fast, no body transfer).
   *  2. If HEAD returns 405 (Method Not Allowed), fall back to GET.
   *  3. Accept ONLY status 200 as valid — no redirects.
   *
   * @param url The URL string to validate.
   * @returns UrlValidationResult with isValid, statusCode and optional error.
   */
  async validateUrl(url: string): Promise<UrlValidationResult> {
    // Guard: reject empty/blank inputs immediately
    if (!url || url.trim() === '') {
      return { isValid: false, statusCode: null, error: 'URL is empty.' };
    }

    // Guard: validate URL syntax before hitting the network
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return {
        isValid: false,
        statusCode: null,
        error: `Invalid URL format: "${url}"`,
      };
    }

    // Only allow http/https schemes
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        statusCode: null,
        error: `Unsupported protocol: "${parsed.protocol}"`,
      };
    }

    try {
      // Attempt HEAD first
      const headStatus = await this.fetchStatus(url, 'HEAD');

      if (headStatus === 405) {
        // Server doesn't support HEAD — fall back to GET
        const getStatus = await this.fetchStatus(url, 'GET');
        return this.buildResult(getStatus);
      }

      return this.buildResult(headStatus);
    } catch (err: any) {
      return {
        isValid: false,
        statusCode: null,
        error: err?.message ?? 'Network error.',
      };
    }
  }

  private async fetchStatus(url: string, method: 'HEAD' | 'GET'): Promise<number> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method,
        headers: BOT_HEADERS,
        redirect: 'manual', // Do NOT follow redirects — only 200 is acceptable
        signal: controller.signal,
      });
      return response.status;
    } finally {
      clearTimeout(timer);
    }
  }

  private buildResult(statusCode: number): UrlValidationResult {
    return {
      isValid: statusCode === 200,
      statusCode,
      error: statusCode !== 200 ? `URL responded with HTTP ${statusCode}.` : undefined,
    };
  }
}
