import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for Steam Search Proxy
  app.get("/api/steam/search", async (req, res) => {
    const { term } = req.query;
    if (!term) {
      return res.status(400).json({ error: "Search term is required" });
    }

    try {
      const response = await fetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
          term as string
        )}&l=english&cc=US`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Steam Search Error:", error);
      res.status(500).json({ error: "Failed to fetch from Steam" });
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
