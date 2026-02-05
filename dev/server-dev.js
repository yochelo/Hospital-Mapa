const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

console.log("SERVER DEV FILE:", __filename);
console.log("CWD:", process.cwd());

// 🔥 DESACTIVAR CACHE TOTAL
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// ✅ RUTA CORRECTA SIEMPRE
const publicPath = path.resolve(__dirname, "..", "public");
console.log("PUBLIC PATH:", publicPath);

app.use(express.static(publicPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 DEV server SIN CACHE");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📱 http://192.168.0.134:${PORT}`);
});
