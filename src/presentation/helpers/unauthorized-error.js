class UnauthorizedError extends Error {
  constructor() {
    super(`Unauthorized`);
    this.name = "UnauthorizedError";
  }
}

module.exports = { UnauthorizedError };
