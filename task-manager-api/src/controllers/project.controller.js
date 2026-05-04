const projectService = require('../services/project.service');

/**
 * GET /projects
 * Response: [{ id, name, ownerId }]
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /projects
 * Body: { name }
 * Response: { id, name, ownerId }
 */
const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject({
      name: req.body.name,
      ownerId: req.user.id,
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /projects/:id
 * Response: 204 No Content
 */
const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, createProject, deleteProject };
