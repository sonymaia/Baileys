import { getQR, getSocket } from "./whatsapp.js"
import { authMiddleware } from "./middlewares/auth.js"
import QRCode from "qrcode"

export default async function routes(app) {

  /**
   * QR CODE (PROTEGIDO)
   */
  app.get("/qr", { preHandler: authMiddleware }, async (req, reply) => {
    const qr = getQR()

    if (!qr) {
      if (getSocket()) {
        return reply
          .type("text/html")
          .send("<h2>✅ WhatsApp já está conectado!</h2>")
      }

      return reply.send({
        status: "waiting",
        message: "QR ainda não gerado. Aguarde alguns segundos."
      })
    }

    const qrImage = await QRCode.toDataURL(qr)

    reply.type("text/html").send(`
      <html>
        <head><title>WhatsApp QR</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f0f2f5;">
          <div style="background:white;padding:40px;border-radius:10px;text-align:center;">
            <h1>Escaneie o QR Code</h1>
            <img src="${qrImage}" width="300" />
            <p>WhatsApp → Aparelhos conectados → Conectar aparelho</p>
            <script>setTimeout(() => location.reload(), 15000)</script>
          </div>
        </body>
      </html>
    `)
  })

  /**
   * ENVIO DE TEXTO (PROTEGIDO)
   */
  app.post(
    "/sendText",
    { preHandler: authMiddleware },
    async (req, reply) => {
      const sock = getSocket()
      if (!sock) {
        return reply.code(503).send({ error: "WhatsApp não conectado" })
      }

      const { chatId, text } = req.body
      if (!chatId || !text) {
        return reply
          .code(400)
          .send({ error: "chatId e text são obrigatórios" })
      }

      try {
        const id = chatId.includes("@")
          ? chatId
          : `${chatId}@s.whatsapp.net`

        await sock.sendMessage(id, { text })

        return { status: "sent", to: id }
      } catch (err) {
        return reply.code(500).send({
          error: "Falha ao enviar mensagem",
          details: err.message
        })
      }
    }
  )
}
