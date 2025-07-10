"use client"
import "./TaskCard.css"

const TaskCard = ({ task, users, onEdit, onDelete, onSmartAssign, onDragStart, isDragging }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ff4757"
      case "Medium":
        return "#ffa502"
      case "Low":
        return "#2ed573"
      default:
        return "#747d8c"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={`task-card ${isDragging ? "dragging" : ""}`} draggable onDragStart={(e) => onDragStart(e, task)}>
      <div className="task-header">
        <div
          className="priority-indicator"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
          title={`${task.priority} Priority`}
        ></div>
        <div className="task-actions">
          <button className="action-btn smart-assign-btn" onClick={() => onSmartAssign(task._id)} title="Smart Assign">
            🎯
          </button>
          <button className="action-btn edit-btn" onClick={() => onEdit(task)} title="Edit Task">
            ✏️
          </button>
          <button className="action-btn delete-btn" onClick={() => onDelete(task._id)} title="Delete Task">
            🗑️
          </button>
        </div>
      </div>

      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>
        {task.description && <p className="task-description">{task.description}</p>}
      </div>

      <div className="task-footer">
        <div className="task-meta">
          {task.assignedTo && (
            <div className="assigned-user">
              <span className="user-avatar">{task.assignedTo.username.charAt(0).toUpperCase()}</span>
              <span className="user-name">{task.assignedTo.username}</span>
            </div>
          )}
          <div className="task-dates">
            <small>Created: {formatDate(task.createdAt)}</small>
            {task.updatedAt !== task.createdAt && <small>Updated: {formatDate(task.updatedAt)}</small>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
