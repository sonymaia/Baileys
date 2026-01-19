import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"
import Pino from "pino"

let sock = null
let latestQr = null

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("/app/auth")

  sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" })
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      latestQr = qr
      console.log("📲 QR gerado, aguardando leitura...")
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log("⚠️ WhatsApp desconectado:", code)

      if (code !== DisconnectReason.loggedOut) {
        setTimeout(initWhatsApp, 3000)
      } else {
        console.log("❌ Sessão inválida, apague /app/auth")
      }
    }

    if (connection === "open") {
      latestQr = null
      console.log("✅ WhatsApp conectado com sucesso")
    }
  })
}

export function getQr() {
  return latestQr
}

export function getSocket() {
  if (!sock) {
    throw new Error("WhatsApp não inicializado")
  }
  return sock
}
