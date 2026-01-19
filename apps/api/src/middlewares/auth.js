export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Missing Authorization header"
    })
  }

  const [type, token] = authHeader.split(" ")

  if (type !== "Bearer" || !token) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid Authorization format"
    })
  }

  if (token !== process.env.API_KEY) {
    return reply.code(403).send({
      error: "Forbidden",
      message: "Invalid API key"
    })
  }
}
