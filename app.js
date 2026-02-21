require('dotenv').config();

const express = require('express');
const joi = require('joi');


const logger = require('./middleware/logger');
const {
  createTodoValidator,
  editTodoValidator,
  schema
} = require('./middleware/validator.js');

const errorHandler = require('./middleware/errorHandler');
const e = require('express');
const app = express();
app.use(express.json()); // Parse JSON bodies

app.use(logger); // Custom middleware
let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
  { id: 3, task: 'Test the API', completed: true },
  { id: 4, task: 'Deploy to server', completed: true }
];

// GET All – Read
app.get('/todos', (req, res) => {
  res.status(200).json(todos); // Send array as JSON
});

// GET One – Read
app.get('/todos/:id', (req, res) => {
  try {
    const todo = todos.find((t) => t.id === parseInt(req.params.id)); 
    if (!todo) return res.status(404).json({message: 'Todo not found'});
    res.status(200).json({message: 'Todo found', data : todo})
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST New – Create
app.post('/todos', createTodoValidator, (req, res) => {
  try{
    const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const newTodo = { id: todos.length + 1, ...value };
  todos.push(newTodo);
  res.status(201).json(newTodo); // Echo back
  }catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }

  
});

// PATCH Update – Partial
app.patch('/todos/:id', editTodoValidator, (req, res, next) => {
  try {
    const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    Object.assign(todo, req.body); // Merge: e.g., {completed: true}
    res.status(200).json(todo);
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const initialLength = todos.length;
    todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
    if (todos.length === initialLength)
      return res.status(404).json({ error: 'Not found' });
    res.status(204).send(); // Silent success
  } catch (error) {
    next(error); // Pass to error handler
  }
});

app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.json(completed); // Custom Read!
});

app.get('/todos/completed/active', (req, res) => {
  const completed = todos.filter((t) => t.completed !== false);
  res.json(completed); // Custom Read!
});


app.use(errorHandler); // Error-handling middleware

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
