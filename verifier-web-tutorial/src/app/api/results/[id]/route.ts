import { cookies } from 'next/headers'

async function getToken(tenantUrl: string) {
    const region = tenantUrl.split(".")[2];
    const response = await fetch(`https://auth.${region}.mattr.global/oauth/token`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.MATTR_CLIENT_ID,
            client_secret: process.env.MATTR_CLIENT_SECRET,
            audience: tenantUrl,
            grant_type: 'client_credentials'
        })
    })

    const { access_token } = await response.json()
    return access_token
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const tenantUrl = process.env.NEXT_PUBLIC_TENANT_URL;
    if (!tenantUrl) {
        return Response.json({ error: 'No tenant URL configured' });
    }

    const id = (await params).id
    const cookiesStore = await cookies()

    if (!cookiesStore.get('session_id')) {
        return Response.json({ error: 'No valid session for user' }, { status: 401 })
    }

    const response = await fetch(
        `${tenantUrl}/v2/presentations/sessions/${id}/result`,
        {
            headers: {
                authorization: `Bearer ${await getToken(tenantUrl)}`
            }
        }
    )

    const results = await response.json()

    if (results.challenge !== cookiesStore.get('challenge')?.value) {
        return Response.json({ error: 'Challenge does not match' })
    }

    return Response.json({ results })
}
