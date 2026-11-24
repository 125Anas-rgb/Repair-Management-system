const { badRequest } = require('../utils/http');

/**
 * Validate req.body / req.query / req.params with a Zod schema.
 * The parsed (clean) value replaces the original.
 */
const validate = (schema, where = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[where]);
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || where;
      if (!fields[key]) fields[key] = issue.message;
    }
    return next(badRequest('Please check the highlighted fields.', { fields }));
  }
  req[where] = result.data;
  return next();
};

module.exports = { validate };
