const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const http = require("http")
const socketIo = require("socket.io")
require("dotenv").config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/collaborative-todo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["Todo", "In Progress", "Done"], default: "Todo" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  version: { type: Number, default: 1 },
})

const Task = mongoose.model("Task", taskSchema)

// Action Log Schema
const actionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
})

const Action = mongoose.model("Action", actionSchema)

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Helper function to log actions
const logAction = async (action, taskId, userId, details = "") => {
  try {
    const actionLog = new Action({
      action,
      taskId,
      userId,
      details,
    })
    await actionLog.save()

    // Emit to all connected clients
    const populatedAction = await Action.findById(actionLog._id)
      .populate("userId", "username")
      .populate("taskId", "title")

    io.emit("actionLogged", populatedAction)
  } catch (error) {
    console.error("Error logging action:", error)
  }
}

// Routes

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    })

    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    })

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    })

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all users
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, "username email")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all tasks
app.get("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "username")
      .populate("createdBy", "username")
      .populate("lastEditedBy", "username")
      .sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create task
app.post("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body

    // Check if title is unique and not a column name
    const columnNames = ["Todo", "In Progress", "Done"]
    if (columnNames.includes(title)) {
      return res.status(400).json({ message: "Task title cannot match column names" })
    }

    const existingTask = await Task.findOne({ title })
    if (existingTask) {
      return res.status(400).json({ message: "Task title must be unique" })
    }

    const task = new Task({
      title,
      description,
      priority,
      assignedTo: assignedTo || null,
      createdBy: req.user.userId,
      lastEditedBy: req.user.userId,
    })

    await task.save()
    await task.populate("assignedTo", "username")
    await task.populate("createdBy", "username")
    await task.populate("lastEditedBy", "username")

    // Log action
    await logAction("Task Created", task._id, req.user.userId, `Created task: ${title}`)

    // Emit to all connected clients
    io.emit("taskCreated", task)

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update task
app.put("/api/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, version } = req.body
    const taskId = req.params.id

    const existingTask = await Task.findById(taskId)
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check for conflicts
    if (version && existingTask.version !== version) {
      return res.status(409).json({
        message: "Conflict detected",
        currentTask: existingTask,
        conflict: true,
      })
    }

    // Check title uniqueness if title is being changed
    if (title && title !== existingTask.title) {
      const columnNames = ["Todo", "In Progress", "Done"]
      if (columnNames.includes(title)) {
        return res.status(400).json({ message: "Task title cannot match column names" })
      }

      const duplicateTask = await Task.findOne({ title, _id: { $ne: taskId } })
      if (duplicateTask) {
        return res.status(400).json({ message: "Task title must be unique" })
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo || null }),
        lastEditedBy: req.user.userId,
        updatedAt: new Date(),
        $inc: { version: 1 },
      },
      { new: true },
    )
      .populate("assignedTo", "username")
      .populate("createdBy", "username")
      .populate("lastEditedBy", "username")

    // Log action
    let actionDetails = "Updated task"
    if (status && status !== existingTask.status) {
      actionDetails = `Moved task from ${existingTask.status} to ${status}`
    }
    await logAction("Task Updated", taskId, req.user.userId, actionDetails)

    // Emit to all connected clients
    io.emit("taskUpdated", updatedTask)

    res.json(updatedTask)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete task
app.delete("/api/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id
    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    await Task.findByIdAndDelete(taskId)

    // Log action
    await logAction("Task Deleted", taskId, req.user.userId, `Deleted task: ${task.title}`)

    // Emit to all connected clients
    io.emit("taskDeleted", taskId)

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Smart assign task
app.post("/api/tasks/:id/smart-assign", authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id

    // Get all users and their active task counts
    const users = await User.find({})
    const taskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({
          assignedTo: user._id,
          status: { $in: ["Todo", "In Progress"] },
        })
        return { user, count }
      }),
    )

    // Find user with fewest active tasks
    const userWithFewestTasks = taskCounts.reduce((min, current) => (current.count < min.count ? current : min))

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        assignedTo: userWithFewestTasks.user._id,
        lastEditedBy: req.user.userId,
        updatedAt: new Date(),
        $inc: { version: 1 },
      },
      { new: true },
    )
      .populate("assignedTo", "username")
      .populate("createdBy", "username")
      .populate("lastEditedBy", "username")

    // Log action
    await logAction("Smart Assign", taskId, req.user.userId, `Smart assigned to ${userWithFewestTasks.user.username}`)

    // Emit to all connected clients
    io.emit("taskUpdated", updatedTask)

    res.json(updatedTask)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get action logs
app.get("/api/actions", authenticateToken, async (req, res) => {
  try {
    const actions = await Action.find()
      .populate("userId", "username")
      .populate("taskId", "title")
      .sort({ timestamp: -1 })
      .limit(20)
    res.json(actions)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
