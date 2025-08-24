addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://perfect-telegram.pages.dev',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders
        });
    }

    const origin = request.headers.get('Origin') || '';
    if (!origin.includes('perfect-telegram.pages.dev')) {
        return new Response('Forbidden', {
            status: 403,
            headers: corsHeaders
        });
    }


    try {
        const formData = await request.formData();
        const text = `📬 New Submission!\n\nName: ${formData.get('name')}\nEmail: ${formData.get('email')}\nMessage:\n${formData.get('message')}`;

        const textResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });

        if (!textResponse.ok) throw new Error('Failed to send text');

        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            const photoForm = new FormData();
            photoForm.append('chat_id', CHAT_ID);
            photoForm.append('photo', imageFile);
            photoForm.append('caption', '📸 Uploaded image');

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: photoForm
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });


    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }


}
