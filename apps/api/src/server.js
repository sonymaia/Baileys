import Fastify from "fastify"
import { initWhatsApp } from "./whatsapp.js"
import { routes } from "./routes.js"

const app = Fastify({ logger: true })

await initWhatsApp()
await app.register(routes)

app.listen({
  port: 3000,
  host: "0.0.0.0"
})
