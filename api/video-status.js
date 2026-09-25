export default async function handler(req, res) {

    const { taskId } = req.query;

    if (!taskId) {
        return res.status(400).json({ error: "taskId majburiy" });
    }

    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
    const RUNWAY_VERSION = "2024-11-06";
    const RUNWAY_BASE = "https://api.dev.runwayml.com/v1";

    try {

        const runwayRes = await fetch(`${RUNWAY_BASE}/tasks/${taskId}`, {
            headers: {
                "Authorization": `Bearer ${RUNWAY_API_KEY}`,
                "X-Runway-Version": RUNWAY_VERSION
            }
        });

        const data = await runwayRes.json();

        if (!runwayRes.ok) {
            return res.status(runwayRes.status).json({
                error: data?.error || "Holatni olishda xatolik"
            });
        }

        res.status(200).json({
            status: data.status,
            videoUrl: data.output ? data.output[0] : null,
            failure: data.failure || null
        });

    } catch (err) {
        res.status(500).json({ error: "Server xatoligi: " + err.message });
    }
}
