export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Faqat POST so'rov qabul qilinadi" });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "prompt majburiy" });
    }

    const HF_TOKEN = process.env.HF_API_TOKEN;

    if (!HF_TOKEN) {
        return res.status(500).json({ error: "HF_API_TOKEN sozlanmagan" });
    }

    const MODEL = "damo-vilab/text-to-video-ms-1.7b";
    const url = `https://api-inference.huggingface.co/models/${MODEL}`;

    try {

        let response;
        let attempt = 0;

        while (attempt < 4) {

            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: prompt })
            });

            if (response.status === 503) {
                const data = await response.json().catch(() => ({}));
                const wait = Math.min(Math.ceil(data.estimated_time || 20), 60);
                await new Promise(r => setTimeout(r, wait * 1000));
                attempt++;
                continue;
            }

            break;
        }

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText || "Hugging Face xatoligi" });
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUri = `data:video/mp4;base64,${base64}`;

        res.status(200).json({ videoUrl: dataUri });

    } catch (err) {
        res.status(500).json({ error: "Server xatoligi: " + err.message });
    }
}
