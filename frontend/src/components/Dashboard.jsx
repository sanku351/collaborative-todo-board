"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import KanbanBoard from "./KanbanBoard"
import ActivityLog from "./ActivityLog"
import TaskModal from "./TaskModal"
import ConflictModal from "./ConflictModal"
import "./Dashboard.css"

const Dashboard = ({ socket }) => {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [actions, setActions] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [conflictData, setConflictData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("taskCreated", (task) => {
        setTasks((prev) => [task, ...prev])
      })

      socket.on("taskUpdated", (updatedTask) => {
        setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
      })

      socket.on("taskDeleted", (taskId) => {
        setTasks((prev) => prev.filter((task) => task._id !== taskId))
      })

      socket.on("actionLogged", (action) => {
        setActions((prev) => [action, ...prev.slice(0, 19)])
      })

      return () => {
        socket.off("taskCreated")
        socket.off("taskUpdated")
        socket.off("taskDeleted")
        socket.off("actionLogged")
      }
    }
  }, [socket])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const [tasksRes, usersRes, actionsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/actions`, { headers }),
      ])

      const tasksData = await tasksRes.json()
      const usersData = await usersRes.json()
      const actionsData = await actionsRes.json()

      setTasks(tasksData)
      setUsers(usersData)
      setActions(actionsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      const token = localStorage.getItem("token")
      const url = editingTask
        ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${editingTask._id}`
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks`

      const method = editingTask ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskData,
          version: editingTask?.version,
        }),
      })

      if (response.status === 409) {
        const conflictResponse = await response.json()
        setConflictData({
          currentTask: conflictResponse.currentTask,
          userChanges: taskData,
          taskId: editingTask._id,
        })
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      setShowTaskModal(false)
      setEditingTask(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }
    } catch (error) {
      alert(error.message)
    }
  }

  const handleSmartAssign = async (taskId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${taskId}/smart-assign`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to smart assign task")
      }
    } catch (error) {
      alert(error.message)
    }
  }

  const handleConflictResolve = async (resolution, data) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${data.taskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            forceUpdate: true,
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to resolve conflict")
      }

      setConflictData(null)
      setShowTaskModal(false)
      setEditingTask(null)
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your workspace...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Collaborative To-Do Board</h1>
          <span className="user-welcome">Welcome, {user?.username}!</span>
        </div>
        <div className="header-right">
          <button className="create-task-btn" onClick={handleCreateTask}>
            + New Task
          </button>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="main-content">
          <KanbanBoard
            tasks={tasks}
            users={users}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onSmartAssign={handleSmartAssign}
            setTasks={setTasks}
          />
        </div>

        <div className="sidebar">
          <ActivityLog actions={actions} />
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
        />
      )}

      {conflictData && (
        <ConflictModal
          conflictData={conflictData}
          onResolve={handleConflictResolve}
          onClose={() => setConflictData(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
