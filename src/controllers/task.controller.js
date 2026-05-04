const taskService = require('../services/task.service');

/**
 * GET /tasks?projectId=<id>
 * Response: [{ id, title, status, assignedTo, projectId }]
 */
const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks({
      projectId: req.query.projectId,
      user: req.user,
    });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /tasks
 * Body: { title, description?, status?, projectId, assignedTo?, dueDate? }
 * Response: { id, title, status, assignedTo, projectId }
 */
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /tasks/:id
 * Body: { title?, description?, status?, assignedTo?, dueDate? }
 * Response: { id, title, status, assignedTo, projectId }
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /tasks/:id
 * Response: 204 No Content
 */
const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
