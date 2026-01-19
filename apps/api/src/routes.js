import { getQR, getSocket } from "./whatsapp.js"
import QRCode from 'qrcode'

export default async function routes(app) {
  
  // Rota para visualizar o QR Code no navegador
  app.get("/qr", async (req, reply) => {
    const qr = getQR()

    if (!qr) {
      if (getSocket()) {
        return reply.type('text/html').send('<h2>WhatsApp já está conectado!</h2>')
      }
      return reply.send({ status: "waiting", message: "QR ainda não gerado. Aguarde alguns segundos e atualize." })
    }

    const qrImage = await QRCode.toDataURL(qr)
    
    reply.type('text/html').send(`
      <html>
        <head><title>WhatsApp QR Scan</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#f0f2f5;">
          <div style="background:white; padding:40px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); text-align:center;">
            <h1>Escaneie o QR Code</h1>
            <img src="${qrImage}" style="width:300px; height:300px;" />
            <p style="color:#666;">Abra o WhatsApp > Aparelhos Conectados > Conectar um aparelho</p>
            <script>setTimeout(() => location.reload(), 15000)</script>
          </div>
        </body>
      </html>
    `)
  })

  // Rota de envio de mensagem
  app.post("/sendText", async (req, reply) => {
    const sock = getSocket()
    if (!sock) return reply.code(503).send({ error: "WhatsApp não conectado" })

    const { chatId, text } = req.body
    if (!chatId || !text) return reply.code(400).send({ error: "chatId e text são obrigatórios" })

    try {
      // Formata o ID se necessário (ex: 5511999999999@s.whatsapp.net)
      const id = chatId.includes('@') ? chatId : `${chatId}@s.whatsapp.net`
      await sock.sendMessage(id, { text })
      return { status: "sent", to: id }
    } catch (err) {
      return reply.code(500).send({ error: "Falha ao enviar mensagem", details: err.message })
    }
  })
}