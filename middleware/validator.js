const Joi = require('joi');

 const schema = Joi.object({
    task: Joi.string().min(3).max(100).required(),
    completed: Joi.boolean().optional(),
  });

const createTodoValidator = (req, res, next) => {
    const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const editTodoValidator = (req, res, next) => {
  const schema = Joi.object({
    task: Joi.string().min(3).max(100).optional(),
    completed: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { createTodoValidator, editTodoValidator, schema };
