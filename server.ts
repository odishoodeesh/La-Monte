import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // S3 Client Setup
  const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
  });

  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/upload", upload.single("image"), async (req, res) => {
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
        ACL: "public-read",
      });

      await s3Client.send(command);

      // Construct the public URL
      // For Supabase, the public URL is usually: {endpoint}/{bucket}/{key}
      // But the endpoint provided is the S3 one. 
      // Supabase public URL format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{key}
      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://immwdjlbadltxvfaeqfv.supabase.co';
      const projectRef = supabaseUrl.split("//")[1].split(".")[0];
      const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;

      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle base64 uploads (for AI generated images)
  app.post("/api/upload-base64", async (req, res) => {
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
        ACL: "public-read",
      });

      await s3Client.send(command);

      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://immwdjlbadltxvfaeqfv.supabase.co';
      const projectRef = supabaseUrl.split("//")[1].split(".")[0];
      const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;

      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("Base64 upload error:", error);
      res.status(500).json({ error: error.message });
    }
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
