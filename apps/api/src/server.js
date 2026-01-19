import Fastify from "fastify"
import { initWhatsApp } from "./whatsapp.js"
import routes from "./routes.js" // Importação padrão (sem chaves)
import "dotenv/config"

const app = Fastify({ logger: true })

// Inicializa o WhatsApp se a variável de ambiente permitir
if (process.env.ENABLE_WHATSAPP === "true") {
  await initWhatsApp()
}

// Registra as rotas
await app.register(routes)

const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT || 3000),
      host: "0.0.0.0"
    })
    console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT || 3000}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()