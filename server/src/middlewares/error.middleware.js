export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, _next) {
  console.error('[ServerError]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Erro interno no servidor.'
  });
}
