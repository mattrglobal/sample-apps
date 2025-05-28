import { cookies } from 'next/headers'

export async function POST() {
    const sessionId = crypto.randomUUID()
    const challenge = crypto.randomUUID()

    const cookieStore = await cookies()
    cookieStore.set('session_id', sessionId, { httpOnly: true, secure: true, sameSite: true })
    cookieStore.set('challenge', challenge, { httpOnly: true, secure: true, sameSite: true })

    return Response.json({ challenge }, { status: 201 })
}
