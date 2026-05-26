import { ZodError, type ZodSchema } from 'zod';

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

export function zodErrorResponse(err: ZodError) {
  return Response.json(
    {
      error: 'Validation failed',
      issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
    },
    { status: 400 },
  );
}

/**
 * Parse + validate a request body in one step.
 *
 * Returns either `{ ok: true, data }` (validated) or `{ ok: false, response }`
 * (a Response the route should return as-is). Consolidates the previously
 * inlined `try { await req.json() } catch { 400 }` + `ZodError` handling.
 *
 * Usage:
 *   const parsed = await parseJson(request, createPollSchema);
 *   if (!parsed.ok) return parsed.response;
 *   const input = parsed.data; // fully typed
 */
export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: jsonError('Invalid JSON body', 400) };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return { ok: false, response: zodErrorResponse(result.error) };
  }
  return { ok: true, data: result.data };
}
