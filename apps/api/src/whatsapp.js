import baileys from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"

const makeWASocket = baileys.default || baileys
const { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion 
} = baileys

let sock = null
let qrCode = null
let isConnecting = false

export async function initWhatsApp() {
  if (isConnecting) return
  isConnecting = true

  console.log("📲 Inicializando WhatsApp...")

  try {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update

      if (qr) {
        qrCode = qr
        console.log("📸 Novo QR Code gerado")
      }

      if (connection === "open") {
        console.log("✅ WhatsApp conectado!")
        qrCode = null
        isConnecting = false
      }

      if (connection === "close") {
        isConnecting = false
        const statusCode = (lastDisconnect?.error instanceof Boom)?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        console.log(`⚠️ Conexão fechada. Razão: ${statusCode}. Reconectando: ${shouldReconnect}`)

        if (shouldReconnect) {
          setTimeout(() => initWhatsApp(), 5000)
        } else {
          console.log("❌ Desconectado: Você precisa deletar a pasta /auth e escanear novamente.")
        }
      }
    })
  } catch (err) {
    console.error("Erro fatal na inicialização:", err)
    isConnecting = false
  }
}

export const getSocket = () => sock
export const getQR = () => qrCode