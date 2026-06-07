import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UrlValidator } from './UrlValidator';

describe('UrlValidator', () => {
  let validator: UrlValidator;

  beforeEach(() => {
    validator = new UrlValidator();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return isValid: true for a URL that responds with status 200 (HEAD)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    const result = await validator.validateUrl('https://example.com');

    expect(result.isValid).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeUndefined();
  });

  it('should return isValid: false for a URL that responds with status 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));

    const result = await validator.validateUrl('https://example.com/not-found');

    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBe(404);
  });

  it('should return isValid: false for a URL that responds with status 301 (redirect)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 301 }));

    const result = await validator.validateUrl('https://example.com/redirect');

    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBe(301);
  });

  it('should return isValid: false for a URL that responds with status 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    const result = await validator.validateUrl('https://example.com/error');

    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBe(500);
  });

  it('should fall back to GET when HEAD returns 405 Method Not Allowed', async () => {
    // First call (HEAD) returns 405
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 405 }))
      // Second call (GET) returns 200
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const result = await validator.validateUrl('https://example.com/no-head');

    expect(result.isValid).toBe(true);
    expect(result.statusCode).toBe(200);
    // Must have been called twice: HEAD then GET
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should return isValid: false when network throws an error (timeout/DNS failure)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('fetch failed'));

    const result = await validator.validateUrl('https://invalid-domain-xyz-123.example');

    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('should reject invalid URL format without making a network call', async () => {
    const result = await validator.validateUrl('not-a-valid-url');

    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should return isValid: false for empty string', async () => {
    const result = await validator.validateUrl('');

    expect(result.isValid).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
