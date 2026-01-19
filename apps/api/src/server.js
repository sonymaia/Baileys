import Fastify from "fastify"
import rateLimit from "@fastify/rate-limit"
import { initWhatsApp } from "./whatsapp.js"
import { routes } from "./routes.js"
import "dotenv/config"

const app = Fastify({ logger: true })

// Rate limit
await app.register(rateLimit, {
  global: true,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  timeWindow: Number(process.env.RATE_LIMIT_WINDOW || 60000)
})

// Health
app.get("/health", async () => ({
  status: "ok"
}))

// 🔒 ROTAS REGISTRADAS UMA ÚNICA VEZ
await app.register(routes)

// WhatsApp só inicializa, NÃO registra rota
if (process.env.ENABLE_WHATSAPP === "true") {
  console.log("📲 Inicializando WhatsApp")
  initWhatsApp() // ❗ SEM await
}

await app.listen({
  port: Number(process.env.PORT || 3000),
  host: "0.0.0.0"
})
