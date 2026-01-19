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
          <div style="background:white;padding:40px;border-radius:10px;text-align:center;box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1>Escaneie o QR Code</h1>
            <img src="${qrImage}" width="300" />
            <p style="color: #666;">WhatsApp → Aparelhos conectados → Conectar aparelho</p>
            <script>setTimeout(() => location.reload(), 20000)</script>
          </div>
        </body>
      </html>
    `)
  })

  /**
   * LISTAR GRUPOS (NOVO - PROTEGIDO)
   * Útil para descobrir o JID correto dos grupos (@g.us)
   */
  app.get("/groups", { preHandler: authMiddleware }, async (req, reply) => {
    const sock = getSocket()
    if (!sock) {
      return reply.code(503).send({ error: "WhatsApp não conectado" })
    }

    try {
      const groups = await sock.groupFetchAllParticipating()
      const list = Object.values(groups).map((g) => ({
        id: g.id,
        subject: g.subject,
        participantsCount: g.participants.length
      }))

      return list
    } catch (err) {
      return reply.code(500).send({
        error: "Falha ao listar grupos",
        details: err.message
      })
    }
  })

  /**
   * ENVIO DE TEXTO (PROTEGIDO)
   */
  app.post("/sendText", { preHandler: authMiddleware }, async (req, reply) => {
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
      // Determina o sufixo correto: 
      // Se já tem @, mantém. Se terminar com @g.us ou for detectado como grupo, usa g.us, senão s.whatsapp.net
      let id = chatId.includes("@") ? chatId : `${chatId}@s.whatsapp.net`
      
      const isGroup = id.endsWith("@g.us")

      // Melhoria para Grupos: Tenta carregar os metadados para evitar "No sessions" ou "not-acceptable"
      if (isGroup) {
        try {
          // Isso "acorda" a conexão com o grupo antes do envio
          await sock.groupMetadata(id)
        } catch (metadataError) {
          app.log.warn(`Não foi possível buscar metadados para o grupo ${id}: ${metadataError.message}`)
        }
      }

      await sock.sendMessage(id, { text })

      return { 
        status: "sent", 
        to: id,
        type: isGroup ? "group" : "contact"
      }
    } catch (err) {
      app.log.error(err)
      return reply.code(500).send({
        error: "Falha ao enviar mensagem",
        details: err.message,
        code: err.output?.statusCode || 500
      })
    }
  })
}