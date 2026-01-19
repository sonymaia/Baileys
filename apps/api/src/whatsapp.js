import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"

let sock
let ready = false

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) console.log("QR_CODE:", qr)

    if (connection === "open") {
      ready = true
      console.log("✅ WhatsApp conectado")
    }

    if (connection === "close") {
      ready = false
      console.log("⚠️ WhatsApp desconectado")
    }
  })
}

export function getSocket() {
  if (!sock || !ready) {
    throw new Error("WhatsApp não está pronto")
  }
  return sock
}
