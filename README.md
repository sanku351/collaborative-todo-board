# Real-Time Collaborative To-Do Board

A full-stack web application that enables multiple users to collaborate on task management in real-time. Built with Node.js, Express, MongoDB, React, and Socket.IO.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Real-Time Collaboration**: Live updates using WebSockets (Socket.IO)
- **Kanban Board**: Drag-and-drop interface with Todo, In Progress, and Done columns
- **Task Management**: Create, edit, delete, and assign tasks
- **Activity Logging**: Track all user actions with timestamps
- **Conflict Resolution**: Handle simultaneous edits gracefully

### Unique Features
- **Smart Assign**: Automatically assigns tasks to users with the fewest active tasks
- **Conflict Handling**: Detects and resolves editing conflicts between users
- **Custom Animations**: Smooth transitions and hover effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time updates
- **Custom CSS** - Styling (no external frameworks)

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```
git clone https://github.com/sanku351/collaborative-todo-board.git
cd collaborative-todo-board
```

### 2. Backend Setup
```
cd backend
npm install
```

Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/collaborative-todo
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Start the backend server:
```
npm run dev
```

### 3. Frontend Setup
```
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5173
```

Start the frontend development server:
```
npm start
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🎯 Usage Guide

### Getting Started
1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: Access the main collaborative workspace

### Task Management
- **Create Task**: Click "New Task" button to add tasks
- **Edit Task**: Click the edit icon on any task card
- **Delete Task**: Click the delete icon to remove tasks
- **Drag & Drop**: Move tasks between columns by dragging
- **Smart Assign**: Click the target icon to auto-assign tasks

### Real-Time Features
- **Live Updates**: See changes from other users instantly
- **Activity Log**: Monitor all team activities in the sidebar
- **Conflict Resolution**: Handle simultaneous edits with conflict modal

## 🧠 Smart Logic Implementation

### Smart Assign Algorithm
The Smart Assign feature automatically assigns tasks to the user with the fewest active tasks:

1. **Query Active Tasks**: Count tasks in "Todo" and "In Progress" status for each user
2. **Find Minimum**: Identify the user with the lowest task count
3. **Auto-Assign**: Assign the task to that user
4. **Update & Notify**: Update the database and notify all connected users

### Conflict Handling System
When multiple users edit the same task simultaneously:

1. **Version Tracking**: Each task has a version number that increments on updates
2. **Conflict Detection**: Compare version numbers when saving changes
3. **Conflict Resolution**: Present both versions to users for manual resolution
4. **Merge Options**: Users can choose to keep current version or apply their changes

## 🎨 Custom Features

### Animations
- **Card Flip**: Smooth task card transitions
- **Drag Effects**: Visual feedback during drag operations
- **Modal Animations**: Slide-in effects for modals
- **Hover States**: Interactive button and card hover effects

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Touch-Friendly**: Large touch targets for mobile users

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Create account on your preferred platform
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
4. Deploy the backend service

### Frontend Deployment (Vercel/Netlify)
1. Create account on your preferred platform
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set environment variable: `VITE_API_URL`
5. Deploy the frontend

### Environment Variables Setup
Make sure to configure these environment variables in your deployment platform:

**Backend:**
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: URL of your deployed frontend
- `PORT`: Port number (usually set automatically)

**Frontend:**
- `VITE_API_URL`: URL of your deployed backend API

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/smart-assign` - Smart assign task

### Users & Activity
- `GET /api/users` - Get all users
- `GET /api/actions` - Get activity log

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for secure cross-origin requests

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Task CRUD operations
- [ ] Real-time updates across multiple browsers
- [ ] Drag and drop functionality
- [ ] Smart assign feature
- [ ] Conflict resolution
- [ ] Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎥 Demo Video

[Link to Demo Video](your-demo-video-link-here)

## 🔗 Live Demo

[Live Application](your-deployed-app-link-here)

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Contact the development team

**Built with ❤️ for collaborative productivity**
