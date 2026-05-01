const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: "A record with that value already exists.",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;