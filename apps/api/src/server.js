import Fastify from "fastify"
import { initWhatsApp } from "./whatsapp.js"
import { routes } from "./routes.js"
import "dotenv/config"

const app = Fastify({ logger: true })

if (process.env.ENABLE_WHATSAPP === "true") {
  await initWhatsApp()
}

await app.register(routes)

await app.listen({
  port: Number(process.env.PORT || 3000),
  host: "0.0.0.0"
})
