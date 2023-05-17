const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.safeParse(req);
    if (error) {
      return res.status(400).json(error);
    }
    next();
  };
};

module.exports = validate;
