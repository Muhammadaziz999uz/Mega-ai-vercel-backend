export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Faqat POST so'rov qabul qilinadi" });
    }

    const { prompt, imageUrl } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "prompt majburiy" });
    }

    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
    const RUNWAY_VERSION = "2024-11-06";
    const RUNWAY_BASE = "https://api.dev.runwayml.com/v1";

    if (!RUNWAY_API_KEY) {
        return res.status(500).json({ error: "RUNWAY_API_KEY sozlanmagan" });
    }

    try {

        const body = {
            model: "gen4_turbo",
            promptText: prompt,
            promptImage: imageUrl || "https://picsum.photos/1280/768"
        };

        const runwayRes = await fetch(`${RUNWAY_BASE}/image_to_video`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RUNWAY_API_KEY}`,
                "X-Runway-Version": RUNWAY_VERSION,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await runwayRes.json();

        if (!runwayRes.ok) {
            return res.status(runwayRes.status).json({
                error: data?.error || "Runway so'rovi muvaffaqiyatsiz"
            });
        }

        res.status(200).json({ taskId: data.id });

    } catch (err) {
        res.status(500).json({ error: "Server xatoligi: " + err.message });
    }
        }
