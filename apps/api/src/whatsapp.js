import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"
import fs from "fs"

let sock
let latestQR = null
let isConnecting = false

export async function initWhatsApp() {
  if (isConnecting) return
  isConnecting = true

  const authDir = "/app/auth"

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir)

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      latestQR = qr
      console.log("📲 QR gerado, aguardando leitura...")
    }

    if (connection === "open") {
      latestQR = null
      isConnecting = false
      console.log("✅ WhatsApp conectado com sucesso")
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log("⚠️ WhatsApp desconectado:", reason)

      // ❌ NÃO reconecta se precisar de QR
      if (reason === DisconnectReason.loggedOut) {
        console.log("🧹 Sessão inválida, aguardando novo QR")
        isConnecting = false
        return
      }

      // 🔄 reconecta apenas se já estava logado
      if (!latestQR) {
        isConnecting = false
        setTimeout(initWhatsApp, 3000)
      }
    }
  })

  sock.ev.on("creds.update", saveCreds)
}

export function getSocket() {
  if (!sock) {
    throw new Error("WhatsApp não inicializado")
  }
  return sock
}

export function getQR() {
  return latestQR
}
