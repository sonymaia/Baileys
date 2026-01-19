import { getSocket, getQr } from "./whatsapp.js"
import { authMiddleware } from "./middlewares/auth.js"

export async function routes(app) {
  /**
   * Enviar mensagem
   */
  app.post(
    "/sendText",
    { preHandler: authMiddleware },
    async (req, reply) => {
      const { chatId, text } = req.body || {}

      // Valida payload
      if (!chatId || typeof chatId !== "string") {
        return reply.code(400).send({
          error: "Invalid payload",
          message: "chatId é obrigatório"
        })
      }

      if (!text || typeof text !== "string") {
        return reply.code(400).send({
          error: "Invalid payload",
          message: "text é obrigatório"
        })
      }

      if (text.length > 4096) {
        return reply.code(400).send({
          error: "Invalid payload",
          message: "text muito longo"
        })
      }

      const sock = getSocket()

      if (!sock) {
        return reply.code(503).send({
          error: "WhatsApp offline",
          message: "Socket não inicializado"
        })
      }

      try {
        await sock.sendMessage(chatId, { text })
        return { status: "sent" }
      } catch (err) {
        req.log.error(err)
        return reply.code(503).send({
          error: "WhatsApp error",
          message: "Falha ao enviar mensagem"
        })
      }
    }
  )

  /**
   * QR Code
   */
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
}
