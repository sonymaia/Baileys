export async function authMiddleware(request, reply) {
  const auth = request.headers.authorization

  if (!auth) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Missing Authorization header"
    })
  }

  const [type, token] = auth.split(" ")

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
