// An error that carries an HTTP status and a stable code the clients can check.
class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new HttpError(400, 'BAD_REQUEST', message, details);
const unauthorized = (message = 'Please sign in again.') => new HttpError(401, 'UNAUTHORIZED', message);
const forbidden = (message = 'You do not have permission to do this.') => new HttpError(403, 'FORBIDDEN', message);
const notFound = (message = 'Not found.') => new HttpError(404, 'NOT_FOUND', message);
const conflict = (message, details) => new HttpError(409, 'CONFLICT', message, details);

// Lets async route handlers throw; Express 4 does not catch promise rejections by itself.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict, asyncHandler };
