import "dotenv/config"

export async function authMiddleware(request, reply) {
  // 1️⃣ Tenta via Authorization header
  const authHeader = request.headers.authorization
  let token = null

  if (authHeader) {
    const [type, value] = authHeader.split(" ")
    if (type === "Bearer" && value) {
      token = value
    }
  }

  // 2️⃣ Se não veio no header, tenta via query (?key=)
  if (!token && request.query?.key) {
    token = request.query.key
  }

  // 3️⃣ Se ainda não tem token
  if (!token) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "API key não informada"
    })
  }

  // 4️⃣ Validação final
  if (token !== process.env.API_KEY) {
    return reply.code(403).send({
      error: "Forbidden",
      message: "API key inválida"
    })
  }
}
