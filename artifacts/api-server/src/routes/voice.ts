import { Router } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const connectors = new ReplitConnectors();

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

router.post("/api/voice/tts", async (req, res) => {
  try {
    const { text, voiceId = DEFAULT_VOICE_ID } = req.body as {
      text: string;
      voiceId?: string;
    };

    if (!text?.trim()) {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const safeText = text.slice(0, 1500);

    const response = await connectors.proxy(
      "elevenlabs",
      `/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: safeText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs TTS error:", response.status, errText);
      res.status(502).json({ error: "TTS generation failed" });
      return;
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Length", buffer.byteLength.toString());
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("TTS route error:", err);
    res.status(500).json({ error: "Internal TTS error" });
  }
});

router.post("/api/voice/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No audio file provided" });
      return;
    }

    const formData = new FormData();
    const mimeType = req.file.mimetype || "audio/webm";
    const blob = new Blob([req.file.buffer], { type: mimeType });
    formData.append("file", blob, "recording.webm");
    formData.append("model_id", "scribe_v1");

    const response = await connectors.proxy(
      "elevenlabs",
      "/v1/speech-to-text",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs STT error:", response.status, errText);
      res.status(502).json({ error: "STT transcription failed" });
      return;
    }

    const result = (await response.json()) as {
      text?: string;
      transcript?: string;
    };
    const transcript = result.text || result.transcript || "";
    res.json({ transcript });
  } catch (err) {
    console.error("STT route error:", err);
    res.status(500).json({ error: "Internal STT error" });
  }
});

export default router;
