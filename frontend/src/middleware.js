import { NextResponse } from 'next/server';

export function middleware(req) {
    const isAuthenticated = checkAuthentication(req);

    if (isAuthenticated) {
        return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
}

function checkAuthentication(req) {
    // fetch from backend to see session
    return true;
}
