// Request validation middleware

// Validate required fields
export const validateRequired = (...fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    next();
  };
};

// Validate numeric range
export const validateRange = (field, min, max) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (value !== undefined && (value < min || value > max)) {
      return res.status(400).json({
        error: `${field} must be between ${min} and ${max}`
      });
    }

    next();
  };
};

// Validate booking response
export const validateStatusTransition = (req, res, next) => {
  const validResponses = ['accept', 'reject'];
  const { response } = req.body;

  if (!validResponses.includes(response)) {
    return res.status(400).json({
      error: 'Invalid response. Must be "accept" or "reject"'
    });
  }

  next();
};

// Sanitize string inputs
export const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  next();
};
