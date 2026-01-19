import { getSocket } from "./whatsapp.js"

export async function routes(app) {
  app.post("/sendText", async (req, reply) => {
    const { chatId, text } = req.body

    if (!chatId || !text) {
      return reply.code(400).send({ error: "chatId e text obrigatórios" })
    }

    try {
      const sock = getSocket()
      await sock.sendMessage(chatId, { text })
      return { status: "sent" }
    } catch {
      return reply.code(503).send({ error: "WhatsApp conectando" })
    }
  })
}
