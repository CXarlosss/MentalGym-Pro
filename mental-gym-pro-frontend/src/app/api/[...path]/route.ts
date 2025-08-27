// src/app/api/[...path]/route.ts
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

function buildTarget(segments: unknown, search: string) {
  const parts = Array.isArray(segments) ? segments : segments ? [String(segments)] : [];
  const joined = parts.join('/');
  return `${BACKEND_URL}/api/${joined}${search || ''}`;
}

// 👇 aquí tipamos ctx como Record<string, unknown> para evitar `any`
async function proxy(req: NextRequest, ctx: Record<string, unknown>) {
  const target = buildTarget((ctx as { params?: { path?: string[] } })?.params?.path, req.nextUrl.search);

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  };

  const upstream = await fetch(target, init);

  const out = new Headers(upstream.headers);
  out.delete('access-control-allow-origin');
  out.delete('access-control-allow-credentials');
  out.delete('content-length');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
};
