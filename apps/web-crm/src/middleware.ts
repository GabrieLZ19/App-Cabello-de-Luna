import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

const ASSISTANT_RESTRICTED_ROUTES = ["/franchises", "/finances", "/roles"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Leer Token y Rol guardados en las Cookies
  const token = request.cookies.get("iltct_crm_token")?.value;
  const role = request.cookies.get("iltct_crm_role")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // 1. Usuario NO autenticado intentando entrar a ruta privada -> Redirigir a Login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Usuario autenticado intentando ir al /login -> Redirigir a Dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Restricción de permisos para rol ASSISTANT
  if (role === "ASSISTANT") {
    const isRestricted = ASSISTANT_RESTRICTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isRestricted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
