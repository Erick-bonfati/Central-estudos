function notFound(req, res, next) {
  res.status(404).json({ error: 'Rota não encontrada' })
}

function errorHandler(err, req, res, next) {
  console.error(err)
  if (res.headersSent) {
    return next(err)
  }

  const status = err.statusCode || err.status || 500
  const message = err.message || 'Erro interno do servidor'

  res.status(status).json({ error: message })
}

module.exports = { notFound, errorHandler }

