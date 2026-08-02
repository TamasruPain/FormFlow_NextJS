import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const reqHeaders = await headers();
  const cookiesList = request.cookies.getAll();
  
  let sessionWithCache = null;
  let sessionWithoutCache = null;
  let errorWithCache = null;
  let errorWithoutCache = null;

  try {
    sessionWithCache = await auth.api.getSession({
      headers: reqHeaders,
    });
  } catch (err) {
    const errorObj = err as Error;
    errorWithCache = errorObj.message || String(err);
  }

  try {
    sessionWithoutCache = await auth.api.getSession({
      headers: reqHeaders,
      query: { disableCookieCache: true },
    });
  } catch (err) {
    const errorObj = err as Error;
    errorWithoutCache = errorObj.message || String(err);
  }

  // Get raw cookie strings for safety inspection
  const headersObj: Record<string, string> = {};
  reqHeaders.forEach((value, key) => {
    if (key.toLowerCase() === "cookie" || key.toLowerCase() === "authorization") {
      headersObj[key] = `${value.substring(0, 15)}... (len: ${value.length})`;
    } else {
      headersObj[key] = value;
    }
  });

  return NextResponse.json({
    env: {
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "NOT_SET",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT_SET",
      VERCEL_URL: process.env.VERCEL_URL || "NOT_SET",
      NODE_ENV: process.env.NODE_ENV || "NOT_SET",
    },
    request: {
      url: request.url,
      method: request.method,
      cookies: cookiesList.map(c => ({
        name: c.name,
        value: c.value ? `${c.value.substring(0, 10)}... (len: ${c.value.length})` : "empty",
      })),
      headers: headersObj,
    },
    sessionWithCache,
    sessionWithoutCache,
    errorWithCache,
    errorWithoutCache,
  });
}
