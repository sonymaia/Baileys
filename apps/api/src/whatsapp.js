import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"

let sock = null
let currentQr = null

export function getSocket() {
  return sock
}

export function getQr() {
  return currentQr
}

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("/app/auth")

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      currentQr = qr
    }

    if (connection === "open") {
      currentQr = null
      console.log("✅ WhatsApp conectado")
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom) &&
        lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut

      console.warn("⚠️ WhatsApp desconectado")

      if (shouldReconnect) {
        initWhatsApp()
      }
    }
  })

  sock.ev.on("creds.update", saveCreds)
}
