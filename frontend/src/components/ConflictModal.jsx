"use client"

import { useState } from "react"
import "./ConflictModal.css"

const ConflictModal = ({ conflictData, onResolve, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState("current")

  const handleResolve = () => {
    const resolvedData = selectedVersion === "current" ? conflictData.currentTask : conflictData.userChanges

    onResolve("resolved", {
      ...resolvedData,
      taskId: conflictData.taskId,
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="modal-overlay">
      <div className="conflict-modal">
        <div className="modal-header">
          <h2>⚠️ Conflict Detected</h2>
          <p>This task was modified by another user while you were editing it.</p>
        </div>

        <div className="conflict-content">
          <div className="version-comparison">
            <div className="version-section">
              <div className="version-header">
                <input
                  type="radio"
                  id="current"
                  name="version"
                  value="current"
                  checked={selectedVersion === "current"}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                />
                <label htmlFor="current">
                  <strong>Current Version</strong>
                  <small>Last updated: {formatDate(conflictData.currentTask.updatedAt)}</small>
                </label>
              </div>
              <div className="version-details">
                <div className="detail-item">
                  <strong>Title:</strong> {conflictData.currentTask.title}
                </div>
                <div className="detail-item">
                  <strong>Description:</strong> {conflictData.currentTask.description || "No description"}
                </div>
                <div className="detail-item">
                  <strong>Priority:</strong> {conflictData.currentTask.priority}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> {conflictData.currentTask.status}
                </div>
                <div className="detail-item">
                  <strong>Assigned To:</strong> {conflictData.currentTask.assignedTo?.username || "Unassigned"}
                </div>
              </div>
            </div>

            <div className="version-section">
              <div className="version-header">
                <input
                  type="radio"
                  id="yours"
                  name="version"
                  value="yours"
                  checked={selectedVersion === "yours"}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                />
                <label htmlFor="yours">
                  <strong>Your Changes</strong>
                  <small>Your unsaved modifications</small>
                </label>
              </div>
              <div className="version-details">
                <div className="detail-item">
                  <strong>Title:</strong> {conflictData.userChanges.title}
                </div>
                <div className="detail-item">
                  <strong>Description:</strong> {conflictData.userChanges.description || "No description"}
                </div>
                <div className="detail-item">
                  <strong>Priority:</strong> {conflictData.userChanges.priority}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> {conflictData.userChanges.status || conflictData.currentTask.status}
                </div>
                <div className="detail-item">
                  <strong>Assigned To:</strong>{" "}
                  {conflictData.userChanges.assignedTo
                    ? "Updated assignment"
                    : conflictData.currentTask.assignedTo?.username || "Unassigned"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="resolve-btn" onClick={handleResolve}>
            Use Selected Version
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
