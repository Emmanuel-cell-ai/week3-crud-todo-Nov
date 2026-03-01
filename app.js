require('dotenv').config();

const express = require('express');
const joi = require('joi');


const logger = require('./middleware/logger');
const connectDB = require('./database/db');
const Todo  = require('./models/models');

const {
  createTodoValidator,
  editTodoValidator,
  schema
} = require('./middleware/validator.js');

const errorHandler = require('./middleware/errorHandler');
const e = require('express');
const app = express();
app.use(express.json()); // Parse JSON bodies
connectDB(); // Connect to MongoDB

app.use(logger); // Custom middleware


// GET All – Read
app.get('/todos', async(req, res) => {
  const todos = await Todo.find({})
  res.status(200).json(todos); // Send array as JSON
});

// GET One – Read
app.get('/todos/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id); // Mongoose method
    if (!todo) return res.status(404).json({message: 'Todo not found'});
    res.status(200).json({message: 'Todo found', data : todo})
  } catch (error) {
    next(error); // Pass to error handler
  }
});

app.get('/todos', async (req, res, next) => {
  try{
    const {completed} = req.query;
    const filter = {};
    if (completed !== undefined) {
      filter.completed = completed === 'true'; // Convert string to boolean
    }
    const todos = await Todo.find(filter);
    res.json(todos);
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// POST New – Create
app.post('/todos', createTodoValidator, async (req, res, next) => {
  try {
    const {task, completed} = req.body;
    const newTodo = new Todo({task, completed});
    await newTodo.save();
  res.status(201).json(newTodo); // Echo back
  }catch (error) {
    next(error); // Pass to error handler
  }

  
});

// PATCH Update – Partial
app.patch('/todos/:id', editTodoValidator, async(req, res, next) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.status(200).json(todo);
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// DELETE Remove
app.delete('/todos/:id', async(req, res, next) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
      if (!deletedTodo)
      return res.status(404).json({ error: 'Not found' });
    res.status(204).send(); // Silent success
  } catch (error) {
    next(error); // Pass to error handler
  }
});

app.get('/todos/completed', async(req, res, next) => {
  try {
    const completed = await Todo.find({ completed: true})
    res.json(completed); // Custom Read!
  } catch (error) {
    next(error); // Pass to error handler
  }
});

app.get('/todos/completed/active', async(req, res, next) => {
  try {
      const active = await Todo.find({completed: false})
      res.json(active); // Custom Read!
  } catch (error) {
      next(error); // Pass to error handler
  }
});


app.use(errorHandler); // Error-handling middleware

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
