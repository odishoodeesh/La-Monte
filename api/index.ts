import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

async function startServer() {
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
  // Global API logger and prefix handler
  app.use("/api", (req, res, next) => {
    console.log(`[API REQUEST] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // 404 handler for API routes - catch all remaining /api requests
  app.use("/api", (req, res) => {
    console.warn(`[API 404] ${req.method} ${req.originalUrl}`);
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

  // Only listen if not on Vercel
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  if (process.env.VERCEL !== "1") {
    process.exit(1);
  }
});

export default app;
