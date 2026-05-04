const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Returns all projects.
 * Response shape: [{ id, name, ownerId }]
 */
const getAllProjects = async () => {
  return prisma.project.findMany({
    select: { id: true, name: true, ownerId: true },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Creates a new project. Only ADMIN may call this.
 * Response shape: { id, name, ownerId }
 */
const createProject = async ({ name, ownerId }) => {
  return prisma.project.create({
    data: { name, ownerId },
    select: { id: true, name: true, ownerId: true },
  });
};

/**
 * Deletes a project by id. Only ADMIN may call this.
 */
const deleteProject = async (id) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError('Project not found.', 404);
  }
  await prisma.project.delete({ where: { id } });
};

module.exports = { getAllProjects, createProject, deleteProject };
