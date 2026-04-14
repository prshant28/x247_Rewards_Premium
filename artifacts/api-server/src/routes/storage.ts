import { Router, type IRouter, type Request, type Response } from "express";
import { ObjectStorageService, ObjectNotFoundError, StorageNotConfiguredError } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const { name, size, contentType } = req.body || {};

  if (!name || !contentType) {
    res.status(400).json({ error: "Missing required fields: name, contentType" });
    return;
  }

  if (size && size > 10 * 1024 * 1024) {
    res.status(400).json({ error: "File size must not exceed 10 MB" });
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(contentType)) {
    res.status(400).json({ error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" });
    return;
  }

  try {
    const { uploadURL, objectPath } = await objectStorageService.getUploadDetails();
    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      res.status(503).json({ error: "File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." });
      return;
    }
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const publicUrl = Array.isArray(raw) ? raw.join("/") : raw;

    const upstream = await objectStorageService.downloadByPublicUrl(decodeURIComponent(publicUrl));

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const cacheControl = upstream.headers.get("cache-control") || "public, max-age=3600";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", cacheControl);

    if (upstream.body) {
      const { Readable } = await import("stream");
      const nodeStream = Readable.fromWeb(upstream.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    console.error("Error serving object:", error);
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
