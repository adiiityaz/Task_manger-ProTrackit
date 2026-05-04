const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Fetches tasks, filtered by projectId if provided.
 * MEMBER users see only their assigned tasks.
 * Response shape: [{ id, title, status, assignedTo, projectId }]
 */
const getTasks = async ({ projectId, user }) => {
  const where = {};

  if (projectId) {
    where.projectId = projectId;
  }

  // MEMBERs can only see tasks assigned to them
  if (user.role === 'MEMBER') {
    where.assignedTo = user.id;
  }

  return prisma.task.findMany({
    where,
    select: {
      id: true,
      title: true,
      status: true,
      assignedTo: true,
      projectId: true,
      description: true,
      dueDate: true,
      assignee: {
        select: {
          name: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Creates a new task. Only ADMIN may call this.
 * Response shape: { id, title, status, assignedTo, projectId }
 */
const createTask = async ({ title, description, status, projectId, assignedTo, dueDate }) => {
  // Validate project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // Validate assignee if provided
  if (assignedTo) {
    const assignee = await prisma.user.findUnique({ where: { id: assignedTo } });
    if (!assignee) {
      throw new AppError('Assigned user not found.', 404);
    }
  }

  return prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      projectId,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      assignedTo: true,
      projectId: true,
      description: true,
      dueDate: true,
      assignee: {
        select: {
          name: true,
        }
      }
    },
  });
};

/**
 * Updates a task by id.
 * MEMBER can only update tasks assigned to them.
 * ADMIN can update any task.
 * Response shape: { id, title, status, assignedTo, projectId }
 */
const updateTask = async (taskId, updates, user) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  // MEMBER authorization check
  if (user.role === 'MEMBER') {
    if (task.assignedTo !== user.id) {
      throw new AppError('You can only update tasks assigned to you.', 403);
    }
    // MEMBERs can only update status
    const { status } = updates;
    if (!status) {
      throw new AppError('Members may only update the task status.', 400);
    }
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
      select: {
        id: true,
        title: true,
        status: true,
        assignedTo: true,
        projectId: true,
        description: true,
        dueDate: true,
        assignee: {
          select: {
            name: true,
          }
        }
      },
    });
  }

  // ADMIN: validate assignee if changing
  if (updates.assignedTo) {
    const assignee = await prisma.user.findUnique({ where: { id: updates.assignedTo } });
    if (!assignee) {
      throw new AppError('Assigned user not found.', 404);
    }
  }

  const allowedUpdates = {};
  if (updates.title !== undefined) allowedUpdates.title = updates.title;
  if (updates.description !== undefined) allowedUpdates.description = updates.description;
  if (updates.status !== undefined) allowedUpdates.status = updates.status;
  if (updates.assignedTo !== undefined) allowedUpdates.assignedTo = updates.assignedTo;
  if (updates.dueDate !== undefined) allowedUpdates.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;

  return prisma.task.update({
    where: { id: taskId },
    data: allowedUpdates,
    select: {
      id: true,
      title: true,
      status: true,
      assignedTo: true,
      projectId: true,
      description: true,
      dueDate: true,
      assignee: {
        select: {
          name: true,
        }
      }
    },
  });
};

/**
 * Deletes a task by id. Only ADMIN may call this.
 */
const deleteTask = async (taskId) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError('Task not found.', 404);
  }
  await prisma.task.delete({ where: { id: taskId } });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
