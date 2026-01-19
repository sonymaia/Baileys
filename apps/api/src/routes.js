import { getSocket } from "./whatsapp.js"
import { authMiddleware } from "./middlewares/auth.js"

export async function routes(app) {
  app.post(
    "/sendText",
    {
      preHandler: authMiddleware
    },
    async (req, reply) => {
      const { chatId, text } = req.body

      if (!chatId || !text) {
        return reply.code(400).send({
          error: "Bad Request",
          message: "chatId e text são obrigatórios"
        })
      }

      try {
        const sock = getSocket()
        await sock.sendMessage(chatId, { text })
        return { status: "sent" }
      } catch {
        return reply.code(503).send({
          error: "Service Unavailable",
          message: "WhatsApp conectando"
        })
      }
    }
  )
}
