import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"

let sock = null
let qrCode = null
let initializing = false

export async function initWhatsApp() {
  if (sock || initializing) return

  initializing = true
  console.log("📲 Inicializando WhatsApp")

  const { state, saveCreds } = await useMultiFileAuthState("auth")

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr) {
      qrCode = qr
      console.log("📸 QR gerado")
    }

    if (connection === "open") {
      console.log("✅ WhatsApp conectado")
      qrCode = null
    }

    if (connection === "close") {
      console.log("⚠️ WhatsApp desconectado")
      sock = null
      initializing = false
    }
  })

  initializing = false
}

export function getSocket() {
  return sock
}

export function getQR() {
  return qrCode
}
