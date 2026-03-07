import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const headers = new Headers(req.headers);
    headers.set('x-user-email', token.email);
    return NextResponse.next({
        request: { headers },
    });
}