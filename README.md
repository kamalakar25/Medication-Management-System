# 💊 Medication Management System

A comprehensive full-stack application designed for both **patients** and **caretakers** to manage medication schedules, track adherence, and facilitate communication. Built with React frontend and Node.js backend with real-time updates.

## 🌟 Features Overview

### 🏥 **For Patients**
- **Personal Dashboard** with medication overview and statistics
- **Medication Management** - Add, edit, delete, and track medications
- **Photo Proof** - Upload photos when marking medications as taken
- **Adherence Analytics** - Detailed charts and statistics over time
- **Real-time Notifications** - Instant updates from caretakers
- **Flexible Login** - Sign in with username or email

### 👩‍⚕️ **For Caretakers**
- **Patient Management** - Add and monitor multiple patients
- **Medication Oversight** - View patient medications and mark as taken
- **Real-time Monitoring** - Live updates when patients take medications
- **Patient Activity Tracking** - Monitor adherence and medication changes
- **Centralized Dashboard** - Manage all patients from one interface

### 🔐 **Authentication & Security**
- **JWT-based Authentication** with secure token management
- **Role-based Access Control** - Different interfaces for patients and caretakers
- **Flexible Login** - Users can login with username or email
- **Input Validation & Sanitization** - Protection against common attacks
- **Rate Limiting** - Protection against brute force attacks

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Node.js API    │◄──►│  SQLite Database│
│   (Frontend)    │    │   (Backend)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              WebSocket.io
            (Real-time Updates)
\`\`\`

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd medication-management-system
\`\`\`

### 2. Backend Setup
\`\`\`bash
# Navigate to backend directory (if separate) or root
cd backend  # or stay in root if backend is in root

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# Start the server
npm start
\`\`\`

### 3. Frontend Setup
\`\`\`bash
# Navigate to frontend directory
cd frontend  # or src if frontend is in src

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with backend URL
# Start the development server
npm start
\`\`\`

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

\`\`\`
medication-management-system/
├── 📁 backend/                 # Backend application
│   ├── 📁 config/             # Database configuration
│   ├── 📁 middleware/         # Authentication middleware
│   ├── 📁 routes/             # API routes
│   ├── 📁 socket/             # WebSocket handlers
│   ├── 📁 utils/              # Utility functions
│   ├── 📁 uploads/            # File uploads directory
│   ├── 📄 server.js           # Main server file
│   ├── 📄 package.json        # Backend dependencies
│   └── 📄 .env.example        # Environment variables template
├── 📁 frontend/               # Frontend application
│   ├── 📁 public/             # Static files
│   ├── 📁 src/                # Source code
│   │   ├── 📁 components/     # React components
│   │   ├── 📁 contexts/       # React contexts
│   │   ├── 📁 services/       # API services
│   │   ├── 📄 App.js          # Main App component
│   │   └── 📄 index.js        # Entry point
│   ├── 📄 package.json        # Frontend dependencies
│   └── 📄 .env.example        # Environment variables template
├── 📄 README.md               # This file
└── 📄 .gitignore              # Git ignore rules
\`\`\`

## 🔧 Technology Stack

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

### **Frontend**
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Styling**: CSS3 (Grid, Flexbox, Animations)
- **State Management**: React Context API
- **Build Tool**: Create React App

## 🗄️ Database Schema

### **Users Table**
\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'patient',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### **Medications Table**
\`\`\`sql
CREATE TABLE medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
\`\`\`

### **Medication Logs Table**
\`\`\`sql
CREATE TABLE medication_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  taken_at DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  photo_url TEXT,
  FOREIGN KEY (medication_id) REFERENCES medications (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE(medication_id, taken_at)
);
\`\`\`

### **Patient-Caretaker Relationships Table**
\`\`\`sql
CREATE TABLE patient_caretaker (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  caretaker_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users (id),
  FOREIGN KEY (caretaker_id) REFERENCES users (id),
  UNIQUE(patient_id, caretaker_id)
);
\`\`\`

## 🔌 API Endpoints

### **Authentication**
\`\`\`
POST /api/auth/signup     # Create new account
POST /api/auth/login      # Login with username/email
\`\`\`

### **Medications**
\`\`\`
GET    /api/medications              # Get user medications
POST   /api/medications              # Add new medication
PUT    /api/medications/:id          # Update medication
DELETE /api/medications/:id          # Delete medication
POST   /api/medications/:id/mark-taken  # Mark as taken
GET    /api/medications/:id/logs     # Get medication logs
\`\`\`

### **Dashboard**
\`\`\`
GET /api/dashboard/stats  # Get dashboard statistics
\`\`\`

### **Caretaker**
\`\`\`
GET  /api/caretaker/patients                           # Get caretaker's patients
POST /api/caretaker/patients                           # Add patient
GET  /api/caretaker/patients/:id/medications           # Get patient medications
POST /api/caretaker/patients/:id/medications/:id/mark-taken  # Mark patient medication
\`\`\`

### **Analytics**
\`\`\`
GET /api/analytics/adherence?period=week  # Get adherence data
\`\`\`

### **File Upload**
\`\`\`
POST /api/uploads/medication-photo  # Upload medication photo
\`\`\`

## 🔄 Real-time Events

### **Patient Events**
- `medication_added` - New medication added
- `medication_updated` - Medication updated
- `medication_deleted` - Medication deleted
- `medication_taken` - Medication marked as taken
- `medication_taken_by_caretaker` - Caretaker marked medication
- `caretaker_added` - New caretaker assigned

### **Caretaker Events**
- `patient_medication_added` - Patient added medication
- `patient_medication_updated` - Patient updated medication
- `patient_medication_deleted` - Patient deleted medication
- `patient_medication_taken` - Patient took medication

## ⚙️ Environment Variables

### **Backend (.env)**
\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=./database.sqlite

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# CORS
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=./uploads
\`\`\`

### **Frontend (.env)**
\`\`\`env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Environment
REACT_APP_ENV=development
\`\`\`

## 🚀 Deployment

### **Backend Deployment**

#### **Heroku**
\`\`\`bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
\`\`\`

#### **Railway**
\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
\`\`\`

### **Frontend Deployment**

#### **Vercel**
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
\`\`\`

#### **Netlify**
\`\`\`bash
# Build the app
npm run build

# Deploy to Netlify
# Upload build folder or connect GitHub repository
\`\`\`

## 🧪 Testing

### **Backend Testing**
\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
\`\`\`

### **Frontend Testing**
\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
\`\`\`

## 📱 Mobile Support

The application is fully responsive and supports:
- **iOS Safari** (iPhone/iPad)
- **Chrome Mobile** (Android)
- **Progressive Web App** features
- **Touch-friendly** interfaces
- **Offline** capabilities (planned)

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcrypt
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers
- **File Upload Validation** with size and type limits

## 🐛 Troubleshooting

### **Common Issues**

#### **Backend won't start**
\`\`\`bash
# Check if port is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Check environment variables
cat .env
\`\`\`

#### **Frontend can't connect to backend**
\`\`\`bash
# Verify backend is running
curl http://localhost:5000/health

# Check environment variables
cat .env

# Verify CORS settings
\`\`\`

#### **Database issues**
\`\`\`bash
# Delete and recreate database
rm database.sqlite
npm start  # Will recreate tables
\`\`\`

#### **Socket connection issues**
\`\`\`bash
# Check firewall settings
# Verify WebSocket support
# Check browser console for errors
\`\`\`

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow **ESLint** configuration
- Write **tests** for new features
- Update **documentation** as needed
- Use **conventional commits**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/kamalakar25)

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Express.js** for the robust backend framework
- **Socket.io** for real-time capabilities
- **SQLite** for the lightweight database
- **All contributors** who helped improve this project

## 📞 Support

If you have any questions or need help:

- **Create an issue** on GitHub
- **Email**: kkamalakar512@gmail.com
- **Documentation**: Check the `/docs` folder for detailed guides

---

**Made with ❤️ for better medication management**
