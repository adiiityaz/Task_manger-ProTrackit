const { Router } = require('express');
const { body, query } = require('express-validator');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// All task routes require authentication
router.use(authenticate);

// ── GET /tasks?projectId= ────────────────────────────────────────────────────
// ADMIN: all tasks (optionally filtered by projectId)
// MEMBER: only their assigned tasks (optionally filtered by projectId)
router.get(
  '/',
  [
    query('projectId')
      .optional()
      .isUUID()
      .withMessage('projectId must be a valid UUID.'),
  ],
  validate,
  getTasks
);

// ── POST /tasks ──────────────────────────────────────────────────────────────
// ADMIN only
router.post(
  '/',
  authorize('ADMIN'),
  [
    body('title').trim().notEmpty().withMessage('Task title is required.'),
    body('projectId').isUUID().withMessage('A valid projectId (UUID) is required.'),
    body('status')
      .optional()
      .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
      .withMessage('Status must be TODO, IN_PROGRESS, or DONE.'),
    body('assignedTo').optional().isUUID().withMessage('assignedTo must be a valid UUID.'),
    body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO 8601 date.'),
  ],
  validate,
  createTask
);

// ── PATCH /tasks/:id ─────────────────────────────────────────────────────────
// ADMIN: any field | MEMBER: status only (for their tasks)
router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('status')
      .optional()
      .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
      .withMessage('Status must be TODO, IN_PROGRESS, or DONE.'),
    body('assignedTo').optional().isUUID().withMessage('assignedTo must be a valid UUID.'),
    body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO 8601 date.'),
  ],
  validate,
  updateTask
);

// ── DELETE /tasks/:id ────────────────────────────────────────────────────────
// ADMIN only
router.delete('/:id', authorize('ADMIN'), deleteTask);

module.exports = router;
