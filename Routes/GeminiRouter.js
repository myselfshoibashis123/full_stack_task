const router = require("express").Router();
const axios = require("axios");

router.post("/identify", async(req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image provided"
            });
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                contents: [{
                    parts: [{
                            text: "Identify the handwritten number in the image. Return ONLY the number."
                        },
                        {
                            inline_data: {
                                mime_type: "image/png",
                                data: image
                            }
                        }
                    ]
                }]
            }, { headers: { "Content-Type": "application/json" } }
        );

        let result = "Error";

        if (
            response.data &&
            response.data.candidates &&
            response.data.candidates[0] &&
            response.data.candidates[0].content &&
            response.data.candidates[0].content.parts &&
            response.data.candidates[0].content.parts[0] &&
            response.data.candidates[0].content.parts[0].text
        ) {
            result = response.data.candidates[0].content.parts[0].text.trim();
        }

        res.json({ success: true, result });

    } catch (error) {
        console.error("Gemini API Error:", error.response && error.response.data ? error.response.data : error.message);

        res.status(500).json({
            success: false,
            message: "Failed to identify number"
        });
    }
});

module.exports = router;