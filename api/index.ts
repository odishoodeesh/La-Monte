import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

// Logging middleware
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
app.use("/api", (req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    env: process.env.NODE_ENV,
    vercel: process.env.VERCEL === "1"
  });
});

// 404 handler for API routes
app.use("/api", (req, res) => {
  console.warn(`[API 404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: "API route not found",
    method: req.method,
    path: req.originalUrl 
  });
});

// Vite middleware / Static serving (ONLY for non-Vercel environments)
// On Vercel, static files are served via vercel.json rewrites
if (process.env.VERCEL !== "1") {
  const setupFrontend = async () => {
    if (process.env.NODE_ENV !== "production") {
      try {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
        console.log("Vite middleware loaded");
      } catch (e) {
        console.error("Failed to load Vite middleware:", e);
      }
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      console.log("Serving static files from dist");
    }
  };
  setupFrontend();
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error handler caught an error:");
  console.error(`- Method: ${req.method}`);
  console.error(`- URL: ${req.url}`);
  console.error(`- Error:`, err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (req.path.startsWith("/api/")) {
    return res.status(status).json({
      error: message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json({ error: message });
});

export default app;
