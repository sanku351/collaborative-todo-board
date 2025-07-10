import "./ActivityLog.css"

const ActivityLog = ({ actions }) => {
  const formatTime = (timestamp) => {
    const now = new Date()
    const actionTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - actionTime) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return actionTime.toLocaleDateString()
  }

  const getActionIcon = (action) => {
    switch (action) {
      case "Task Created":
        return "➕"
      case "Task Updated":
        return "✏️"
      case "Task Deleted":
        return "🗑️"
      case "Smart Assign":
        return "🎯"
      default:
        return "📝"
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case "Task Created":
        return "#2ed573"
      case "Task Updated":
        return "#ffa502"
      case "Task Deleted":
        return "#ff4757"
      case "Smart Assign":
        return "#5352ed"
      default:
        return "#747d8c"
    }
  }

  return (
    <div className="activity-log">
      <div className="activity-header">
        <h3>Recent Activity</h3>
        <span className="activity-count">{actions.length}/20</span>
      </div>

      <div className="activity-list">
        {actions.length === 0 ? (
          <div className="no-activity">
            <p>No recent activity</p>
          </div>
        ) : (
          actions.map((action, index) => (
            <div key={action._id || index} className="activity-item">
              <div className="activity-content">
                <div className="activity-main">
                  <span className="activity-icon" style={{ color: getActionColor(action.action) }}>
                    {getActionIcon(action.action)}
                  </span>
                  <div className="activity-details">
                    <div className="activity-text">
                      <strong>{action.userId?.username || "Unknown User"}</strong>
                      <span className="activity-action"> {action.action.toLowerCase()}</span>
                      {action.taskId && <span className="task-reference"> "{action.taskId.title}"</span>}
                    </div>
                    {action.details && <div className="activity-description">{action.details}</div>}
                  </div>
                </div>
                <div className="activity-time">{formatTime(action.timestamp)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ActivityLog
