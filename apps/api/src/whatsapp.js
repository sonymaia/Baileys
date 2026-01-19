import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys"

let sock
let lastQr = null
let initializing = false

export async function initWhatsApp() {
  if (initializing) return
  initializing = true

  const { state, saveCreds } = await useMultiFileAuthState("/app/auth")

  sock = makeWASocket({
    auth: state,
    browser: ["Ubuntu", "Chrome", "22.04.4"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      lastQr = qr
      console.log("📱 QR gerado (use /qr)")
    }

    if (connection === "open") {
      console.log("✅ WhatsApp conectado com sucesso!")
      lastQr = null
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode

      console.log("⚠️ WhatsApp desconectado:", statusCode)

      if (statusCode !== DisconnectReason.loggedOut) {
        setTimeout(() => {
          initializing = false
          initWhatsApp()
        }, 5000)
      } else {
        console.log("❌ Sessão inválida. Apague /app/auth")
      }
    }
  })
}

export function getSocket() {
  if (!sock) throw new Error("WhatsApp não inicializado")
  return sock
}

export function getQr() {
  return lastQr
}
