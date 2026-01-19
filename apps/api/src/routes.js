import QRCode from 'qrcode'
import { getQR } from "./whatsapp.js"

// ... dentro da função routes ...
app.get("/qr", async (req, reply) => {
  const qr = getQR()

  if (!qr) {
    return reply.send({ status: "waiting", message: "QR ainda não gerado ou já conectado" })
  }

  // Isso gera um link de imagem (Data URI) que abre direto no navegador
  const qrImage = await QRCode.toDataURL(qr)
  
  // Retorna um HTML simples para você escanear direto da tela
  reply.type('text/html').send(`
    <html>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <h1>Escaneie para Conectar</h1>
        <img src="${qrImage}" style="border: 20px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.1);" />
        <p>O QR Code atualiza automaticamente se expirar.</p>
        <script>setTimeout(() => location.reload(), 20000)</script>
      </body>
    </html>
  `)
})