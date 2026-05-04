const { Router } = require('express');
const { body } = require('express-validator');
const { getProjects, createProject, deleteProject } = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// All project routes require authentication
router.use(authenticate);

// ── GET /projects ────────────────────────────────────────────────────────────
// Any authenticated user can list projects
router.get('/', getProjects);

// ── POST /projects ───────────────────────────────────────────────────────────
// ADMIN only
router.post(
  '/',
  authorize('ADMIN'),
  [body('name').trim().notEmpty().withMessage('Project name is required.')],
  validate,
  createProject
);

// ── DELETE /projects/:id ─────────────────────────────────────────────────────
// ADMIN only
router.delete('/:id', authorize('ADMIN'), deleteProject);

module.exports = router;
