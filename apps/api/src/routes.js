import { getSocket, getQR } from "./whatsapp.js"
import { authMiddleware } from "./middlewares/auth.js"

export async function routes(app) {

  app.get("/qr", async () => {
    const qr = getQR()

    if (!qr) {
      return {
        status: "ok",
        message: "WhatsApp já conectado ou QR indisponível"
      }
    }

    return { qr }
  })

  app.post(
    "/sendText",
    { preHandler: authMiddleware },
    async (req, reply) => {
      const { chatId, text } = req.body

      if (!chatId || !text) {
        return reply.code(400).send({
          error: "chatId e text obrigatórios"
        })
      }

      try {
        const sock = getSocket()
        await sock.sendMessage(chatId, { text })
        return { status: "sent" }
      } catch (err) {
        return reply.code(503).send({
          error: "WhatsApp não conectado"
        })
      }
    }
  )
}
