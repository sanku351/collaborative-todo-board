"use client"

import { useState } from "react"
import TaskCard from "./TaskCard"
import "./KanbanBoard.css"

const KanbanBoard = ({ tasks, users, onEditTask, onDeleteTask, onSmartAssign, setTasks }) => {
  const [draggedTask, setDraggedTask] = useState(null)

  const columns = ["Todo", "In Progress", "Done"]

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks/${draggedTask._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            version: draggedTask.version,
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      // Update local state optimistically
      setTasks((prev) =>
        prev.map((task) =>
          task._id === draggedTask._id ? { ...task, status: newStatus, version: task.version + 1 } : task,
        ),
      )
    } catch (error) {
      console.error("Error updating task:", error)
      alert(error.message)
    } finally {
      setDraggedTask(null)
    }
  }

  return (
    <div className="kanban-board">
      {columns.map((column) => (
        <div key={column} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column)}>
          <div className="column-header">
            <h3>{column}</h3>
            <span className="task-count">{getTasksByStatus(column).length}</span>
          </div>

          <div className="column-content">
            {getTasksByStatus(column).map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                users={users}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onSmartAssign={onSmartAssign}
                onDragStart={handleDragStart}
                isDragging={draggedTask?._id === task._id}
              />
            ))}

            {getTasksByStatus(column).length === 0 && (
              <div className="empty-column">
                <p>No tasks in {column.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard
