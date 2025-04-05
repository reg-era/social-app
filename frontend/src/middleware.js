import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/signup']
const privateRoutes = ['/', '/profile', '/chat', '/group']

export async function middleware(req) {
    const path = req.nextUrl.pathname

    const authorized = await checkAuthentication(req.cookies.get('auth_session')?.value)

    const isDynamicRoute = /^(\/profile|\/group)\/[^/]+$/.test(path);
    if (!authorized && (privateRoutes.includes(path) || isDynamicRoute)) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    if (publicRoutes.includes(path) && authorized) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    return NextResponse.next();
}

async function checkAuthentication(token) {
    try {
        if (!token || token.length <= 0) {
            return false
        }
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/check`, {
            method: 'POST',
            headers: {
                'Authorization': token,
            },
        });

        return res.ok;
    } catch (err) {
        console.error(err);
        return false
    }
}
