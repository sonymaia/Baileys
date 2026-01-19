import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"

let sock = null
let qrCode = null

export async function initWhatsApp() {
  console.log("📲 Inicializando WhatsApp...")

  const { state, saveCreds } = await useMultiFileAuthState("auth")
  
  // Busca a versão mais recente suportada para evitar erros de "versão antiga"
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`Usando versão WA v${version.join('.')}, isLatest: ${isLatest}`)

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    // Melhora a estabilidade em Docker
    browser: ["Baileys API", "Chrome", "10.0.0"] 
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr) {
      qrCode = qr
      console.log("📸 Novo QR Code gerado")
    }

    if (connection === "open") {
      console.log("✅ WhatsApp conectado com sucesso!")
      qrCode = null
    }

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      
      console.log('⚠️ Conexão fechada devido a ', lastDisconnect.error, ', reconectando ', shouldReconnect)
      
      qrCode = null
      sock = null

      // Lógica de Reconexão
      if (shouldReconnect) {
        // Pequeno delay para evitar loop frenético
        setTimeout(() => initWhatsApp(), 5000)
      } else {
        console.log('❌ Desconectado (Logout). Delete a pasta "auth" e reinicie para scanear novamente.')
      }
    }
  })
}

export function getSocket() {
  return sock
}

export function getQR() {
  return qrCode
}