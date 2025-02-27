import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/signup']
const privateRoutes = ['/', '/profile', '/chat', '/group']

export async function middleware(req) {
    const path = req.nextUrl.pathname

    const authorized = await checkAuthentication(req.cookies.get('auth_session'))

    if (privateRoutes.includes(path) && !authorized) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    if (publicRoutes.includes(path) && authorized) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    return NextResponse.next();
}

async function checkAuthentication(token) {
    try {
        if (token.value.length <= 0) {
            return false
        }
        const res = await fetch('http://127.0.0.1:8080/api/check', {
            method: 'POST',
            headers: {
                'Authorization': token.value,
            },
        });

        return res.ok;
    } catch (err) {
        console.error(err);
        return false
    }
}
