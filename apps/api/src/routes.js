import { getSocket, getQr } from "./whatsapp.js"
import { authMiddleware } from "./middlewares/auth.js"

export async function routes(app) {
  // QR
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

  // Enviar mensagem
  app.post(
    "/sendText",
    { preHandler: authMiddleware },
    async (req, reply) => {
      const { chatId, text } = req.body || {}

      if (!chatId || !text) {
        return reply.code(400).send({
          error: "chatId e text são obrigatórios"
        })
      }

      const sock = getSocket()
      if (!sock) {
        return reply.code(503).send({
          error: "WhatsApp offline"
        })
      }

      await sock.sendMessage(chatId, { text })
      return { status: "sent" }
    }
  )
}
