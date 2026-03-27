import express from "express";
import dotenv from "dotenv";

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
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
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

// Only listen if not on Vercel
if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
