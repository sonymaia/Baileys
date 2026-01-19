import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import pino from "pino"

let sock

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("sessions/whatsapp")

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" })
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("📱 QR CODE GERADO — escaneie no WhatsApp")
    }

    if (connection === "open") {
      console.log("✅ WhatsApp CONECTADO com sucesso")
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode

      console.log("⚠️ WhatsApp desconectado:", reason)

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Tentando reconectar...")
        initWhatsApp()
      } else {
        console.log("❌ Sessão expirada, precisa novo QR")
      }
    }
  })
}

export function getSocket() {
  if (!sock) {
    throw new Error("WhatsApp não inicializado")
  }
  return sock
}
