import Fastify from "fastify"
import { initWhatsApp } from "./whatsapp.js"
import { routes } from "./routes.js"

const app = Fastify({ logger: true })

/**
 * Healthcheck (não depende do WhatsApp)
 */
app.get("/health", async () => {
  return {
    status: "ok",
    service: "baileys-api",
    timestamp: new Date().toISOString()
  }
})

/**
 * Inicializa WhatsApp
 */
await initWhatsApp()

/**
 * Rotas da API
 */
await app.register(routes)

/**
 * Start server (IMPORTANTE: await)
 */
await app.listen({
  port: process.env.PORT || 3000,
  host: "0.0.0.0"
})
