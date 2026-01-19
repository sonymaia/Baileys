import Fastify from "fastify"
import rateLimit from "@fastify/rate-limit"
import { initWhatsApp } from "./whatsapp.js"
import { routes } from "./routes.js"
import "dotenv/config"

const app = Fastify({
  logger: true
})

/**
 * Rate Limit GLOBAL
 */
await app.register(rateLimit, {
  global: true,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  timeWindow: Number(process.env.RATE_LIMIT_WINDOW || 60000)
})

/**
 * Healthcheck (público)
 */
app.get("/health", async () => {
  return {
    status: "ok",
    service: "baileys-api",
    timestamp: new Date().toISOString()
  }
})

/**
 * Inicializa WhatsApp apenas se habilitado
 */
if (process.env.ENABLE_WHATSAPP === "true") {
  app.log.info("WhatsApp ENABLED, initializing...")
  await initWhatsApp()
} else {
  app.log.warn("WhatsApp DISABLED by environment variable")
}

/**
 * Registra rotas
 */
await app.register(routes)

/**
 * Start server
 */
await app.listen({
  port: Number(process.env.PORT || 3000),
  host: "0.0.0.0"
})

/**
 * Graceful shutdown
 */
const closeApp = async (signal) => {
  app.log.warn(`Received ${signal}, shutting down...`)
  await app.close()
  process.exit(0)
}

process.on("SIGINT", closeApp)
process.on("SIGTERM", closeApp)
