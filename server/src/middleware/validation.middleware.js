/**
 * Creates a validation middleware from a Joi schema.
 * Validates req.body and returns 400 with field-level errors on failure.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, ''),
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details,
      },
    });
  }

  req.body = value;
  next();
};
