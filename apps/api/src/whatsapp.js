import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import fs from "fs"

let sock

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("/app/auth")

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false // 👈 NÃO usar mais
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("📱 ESCANEIE ESTE QR NO WHATSAPP:")
      console.log(qr)
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode

      console.log("⚠️ WhatsApp desconectado:", statusCode)

      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("🔄 Tentando reconectar...")
        initWhatsApp()
      } else {
        console.log("❌ Sessão inválida. Apague /app/auth e escaneie novamente.")
      }
    }

    if (connection === "open") {
      console.log("✅ WhatsApp conectado com sucesso!")
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
