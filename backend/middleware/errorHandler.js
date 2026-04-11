const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("[ApnaGaon API error]", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
