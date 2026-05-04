import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const PORT = 3000;
const SECRET_KEY = "super_secret_key";

app.use(express.json());

// In-memory data store
const users: any[] = [
  { 
    id: "0", 
    email: "admin@example.com", 
    password: "", // Will be hashed below
    name: "Admin User" 
  }
];

// Hash the default user password on startup
(async () => {
  users[0].password = await bcrypt.hash("password123", 10);
})();
const projects: any[] = [
  { id: "1", name: "Website Redesign", description: "Modernizing the company website." },
  { id: "2", name: "Mobile App", description: "iOS and Android task manager." },
  { id: "3", name: "Backend Migration", description: "Moving to microservices." },
];
const tasks: any[] = [
  { id: "1", projectId: "1", title: "Design homepage", status: "DONE", priority: "HIGH", dueDate: "2026-05-10", assignee: "John Doe", description: "Create high-fidelity mockups for the landing page." },
  { id: "2", projectId: "1", title: "Implement Auth", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2026-05-15", assignee: "John Doe", description: "Setup JWT and OAuth flow." },
  { id: "3", projectId: "1", title: "API Integration", status: "TODO", priority: "MEDIUM", dueDate: "2026-05-20", assignee: "Jane Smith", description: "Connect frontend components to backend endpoints." },
  { id: "4", projectId: "2", title: "Setup Project", status: "DONE", priority: "LOW", dueDate: "2026-05-01", assignee: "John Doe", description: "Initialize repository and boilerplate." },
  { id: "5", projectId: "1", title: "Database Schema", status: "DONE", priority: "HIGH", dueDate: "2026-05-05", assignee: "Alice Johnson" },
  { id: "6", projectId: "2", title: "User Profiles", status: "TODO", priority: "MEDIUM", dueDate: "2026-05-25", assignee: "Bob Brown" },
];

// Helper to authenticate token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

// API Routes
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: String(users.length + 1), email, password: hashedPassword, name };
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY);
  res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get("/api/projects", authenticateToken, (req, res) => {
  res.json(projects);
});

app.post("/api/projects", authenticateToken, (req, res) => {
  const { name, description } = req.body;
  const newProject = { id: String(projects.length + 1), name, description };
  projects.push(newProject);
  res.json(newProject);
});

app.get("/api/tasks", authenticateToken, (req, res) => {
  const { projectId } = req.query;
  if (projectId) {
    return res.json(tasks.filter(t => t.projectId === projectId));
  }
  res.json(tasks);
});

app.post("/api/tasks", authenticateToken, (req, res) => {
  const { projectId, title, assignee, priority, dueDate, description } = req.body;
  const newTask = { 
    id: String(tasks.length + 1), 
    projectId, 
    title, 
    status: "TODO", 
    priority: priority || "MEDIUM", 
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    assignee: assignee || "Unassigned",
    description: description || ""
  };
  tasks.push(newTask);
  res.json(newTask);
});

app.patch("/api/tasks/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, assignee, priority, dueDate, title, description } = req.body;
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  if (status) task.status = status;
  if (assignee) task.assignee = assignee;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;
  if (title) task.title = title;
  if (description) task.description = description;
  
  res.json(task);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
