import { getQR, getSocket } from "./whatsapp.js"
import { authMiddleware } from "./middlewares/auth.js"

export async function routes(app) {

  // 🔓 Público (QR precisa ser acessado sem auth em muitos casos)
  app.get("/qr", async () => {
    const qr = getQR()

    if (!qr) {
      return {
        status: "waiting",
        message: "QR ainda não gerado"
      }
    }

    return {
      status: "pending",
      qr
    }
  })

  // 🔐 Protegido
  app.post(
    "/sendText",
    { preHandler: authMiddleware },
    async (req, reply) => {
      const sock = getSocket()

      if (!sock) {
        return reply.code(503).send({
          error: "WhatsApp não conectado"
        })
      }

      const { chatId, text } = req.body

      if (!chatId || !text) {
        return reply.code(400).send({
          error: "chatId e text obrigatórios"
        })
      }

      await sock.sendMessage(chatId, { text })
      return { status: "sent" }
    }
  )
}
