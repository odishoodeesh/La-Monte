import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer, { MulterError } from "multer";
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // S3 Client Setup
  const s3Config = {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
  };

  if (!s3Config.endpoint || !s3Config.credentials.accessKeyId || !s3Config.credentials.secretAccessKey) {
    console.warn("WARNING: S3 configuration is incomplete. Media uploads may fail.");
    console.warn("- S3_ENDPOINT:", s3Config.endpoint ? "SET" : "MISSING");
    console.warn("- S3_ACCESS_KEY_ID:", s3Config.credentials.accessKeyId ? "SET" : "MISSING");
    console.warn("- S3_SECRET_ACCESS_KEY:", s3Config.credentials.secretAccessKey ? "SET" : "MISSING");
  }

  const s3Client = new S3Client(s3Config);

  const upload = multer({ storage: multer.memoryStorage() });

  // Logging middleware - MOVE TO TOP
  app.use((req, res, next) => {
    const start = Date.now();
    console.log(`${new Date().toISOString()} - INCOMING: ${req.method} ${req.url}`);
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`${new Date().toISOString()} - COMPLETED: ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get(["/api/health", "/api/health/"], (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  app.get(["/api/media", "/api/media/"], async (req, res) => {
    try {
      const bucketName = process.env.S3_BUCKET || "uploads";
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
      });

      const response = await s3Client.send(command);
      const contents = response.Contents || [];
      
      // Map to a format similar to Supabase storage list
      const media = contents.map(item => ({
        name: item.Key,
        created_at: item.LastModified,
        metadata: {
          size: item.Size,
          mimetype: "image/png" // Default or infer from extension if needed
        }
      })).filter(item => item.name !== ".emptyFolderPlaceholder");

      res.json(media);
    } catch (error: any) {
      console.error("List media error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete(["/api/media/:name", "/api/media/:name/"], async (req, res) => {
    try {
      const { name } = req.params;
      const bucketName = process.env.S3_BUCKET || "uploads";
      
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: name,
      });

      await s3Client.send(command);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete media error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post(["/api/upload", "/api/upload/"], (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        console.error("Unknown upload error:", err);
        return res.status(500).json({ error: `Unknown upload error: ${err.message}` });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileExtension = path.extname(req.file.originalname) || ".png";
      const fileName = `${uuidv4()}${fileExtension}`;
      const bucketName = process.env.S3_BUCKET || "uploads";

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(command);

      // Construct the public URL
      // Supabase public URL format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{key}
      let projectRef = "";
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const s3Endpoint = process.env.S3_ENDPOINT;

      if (supabaseUrl) {
        projectRef = supabaseUrl.split("//")[1].split(".")[0];
      } else if (s3Endpoint) {
        // Try to extract from S3 endpoint: https://{project_ref}.storage.supabase.co/storage/v1/s3
        projectRef = s3Endpoint.split("//")[1].split(".")[0];
      } else {
        // Fallback to the initial project ref if nothing else is available
        projectRef = 'immwdjlbadltxvfaeqfv';
      }

      const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;

      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle base64 uploads (for AI generated images)
  app.post(["/api/upload-base64", "/api/upload-base64/"], async (req, res) => {
    try {
      const { image, name } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${uuidv4()}.png`;
      const bucketName = process.env.S3_BUCKET || "uploads";

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: "image/png",
      });

      await s3Client.send(command);

      let projectRef = "";
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const s3Endpoint = process.env.S3_ENDPOINT;

      if (supabaseUrl) {
        projectRef = supabaseUrl.split("//")[1].split(".")[0];
      } else if (s3Endpoint) {
        projectRef = s3Endpoint.split("//")[1].split(".")[0];
      } else {
        projectRef = 'immwdjlbadltxvfaeqfv';
      }

      const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;

      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("Base64 upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    console.warn(`404 - API Route Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: "API route not found",
      method: req.method,
      path: req.originalUrl 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler caught an error:");
    console.error(`- Method: ${req.method}`);
    console.error(`- URL: ${req.url}`);
    console.error(`- Error:`, err);

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Ensure we always return JSON for API routes
    if (req.path.startsWith("/api/")) {
      return res.status(status).json({
        error: message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }

    // For non-API routes, if headers already sent, delegate to default express handler
    if (res.headersSent) {
      return next(err);
    }

    res.status(status).json({ error: message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
