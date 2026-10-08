// Resolve backend URL dynamically with sensible production fallback
function getBackendUrl() {
  let url = process.env.RENDER_BACKEND_URL || 
            process.env.BACKEND_INTERNAL_URL || 
            process.env.BACKEND_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            (process.env.NODE_ENV === 'production' 
              ? 'https://creatorlens-hydg.onrender.com/api' 
              : 'http://localhost:5000/api');

  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for backend wake up if Render instance is spinning up

async function handler(req, { params }) {
  try {
    const backendUrl = getBackendUrl();
    const pathSegments = params?.path || [];
    const subPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const targetUrl = `${backendUrl}/${subPath}${queryString ? `?${queryString}` : ''}`;

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(lower)) {
        headers.set(key, value);
      }
    });

    let body = null;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      try {
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          body = JSON.stringify(await req.json());
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
          body = await req.arrayBuffer();
        } else {
          body = await req.text();
        }
      } catch (e) {
        body = null;
      }
    }

    let response = null;
    let lastError = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(targetUrl, {
          method: req.method,
          headers,
          body,
          cache: 'no-store'
        });

        if (response.ok || (response.status < 500 && response.status !== 404)) {
          break;
        }

        // If it's a 502/503/504, wait and retry
        if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        break;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        } else {
          throw err;
        }
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const responseData = await response.arrayBuffer();
    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
        resHeaders.set(key, value);
      }
    });

    return new Response(responseData, {
      status: response.status,
      headers: resHeaders
    });
  } catch (error) {
    console.error('[API Gateway Error]:', error);
    const isFetchFail = error.message?.includes('fetch failed');
    const msg = isFetchFail 
      ? 'Backend server is waking up or temporarily unreachable. Please try again in 10-20 seconds.' 
      : 'Backend connection error: ' + error.message;
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = () => new Response(null, { status: 204 });
