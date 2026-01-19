import Fastify from "fastify"
import rateLimit from "@fastify/rate-limit"
import { initWhatsApp, getQr } from "./whatsapp.js"
import { routes } from "./routes.js"
import "dotenv/config"

const app = Fastify({ logger: true })

await app.register(rateLimit, {
  global: true,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  timeWindow: Number(process.env.RATE_LIMIT_WINDOW || 60000)
})

app.get("/health", async () => ({
  status: "ok"
}))

app.get("/qr", async () => {
  const qr = getQr()

  if (!qr) {
    return {
      status: "ok",
      message: "WhatsApp já conectado ou QR indisponível"
    }
  }

  return {
    status: "pending",
    qr
  }
})

if (process.env.ENABLE_WHATSAPP === "true") {
  console.log("📲 Inicializando WhatsApp")
  await initWhatsApp()
}

await app.register(routes)

await app.listen({
  port: Number(process.env.PORT || 3000),
  host: "0.0.0.0"
})
