# 💊 Medication Management System - Backend

A robust Node.js backend API providing secure authentication, medication management, real-time updates, and comprehensive data analytics for the Medication Management System.

## 🌟 Features

### 🔐 **Authentication & Security**
- **JWT-based Authentication** with secure token management
- **Flexible Login** - Users can login with username or email
- **Role-based Access Control** (Patient/Caretaker)
- **Password Hashing** using bcrypt
- **Input Validation & Sanitization** 
- **Rate Limiting** protection
- **CORS & Security Headers** with Helmet.js

### 💊 **Medication Management**
- **Full CRUD Operations** for medications
- **Photo Upload** support for medication proof
- **Medication Logging** with date tracking
- **Adherence Calculation** and statistics
- **Real-time Updates** via WebSocket

### 👥 **Patient-Caretaker System**
- **Patient-Caretaker Relationships** management
- **Cross-user Medication Oversight** for caretakers
- **Real-time Notifications** between users
- **Activity Tracking** and monitoring

### 📊 **Analytics & Reporting**
- **Adherence Analytics** with multiple time periods
- **Dashboard Statistics** calculation
- **Medication Logs** with detailed history
- **Data Export** capabilities (planned)

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone and navigate to backend:**
\`\`\`bash
git clone <repository-url>
cd medication-management-system/backend
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables:**
\`\`\`bash
cp .env.example .env
\`\`\`

4. **Update `.env` file:**
\`\`\`env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
DATABASE_URL=./database.sqlite
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
\`\`\`

5. **Start the server:**
\`\`\`bash
npm start
\`\`\`

6. **Verify the server:**
Navigate to `http://localhost:5000/health`

## 📁 Project Structure

\`\`\`
backend/
├── 📁 config/
│   └── 📄 database.js              # Database configuration and initialization
├── 📁 middleware/
│   └── 📄 auth.js                  # JWT authentication middleware
├── 📁 routes/
│   ├── 📄 auth.js                  # Authentication routes (login/signup)
│   ├── 📄 medications.js           # Medication CRUD operations
│   ├── 📄 caretaker.js            # Caretaker-specific routes
│   ├── 📄 analytics.js            # Analytics and reporting
│   ├── 📄 dashboard.js            # Dashboard statistics
│   └── 📄 uploads.js              # File upload handling
├── 📁 socket/
│   └── 📄 handlers.js              # WebSocket event handlers
├── 📁 utils/
│   └── 📄 validation.js            # Input validation functions
├── 📁 uploads/                     # File upload directory
├── 📄 server.js                    # Main server file
├── 📄 package.json                 # Dependencies and scripts
├── 📄 .env.example                 # Environment variables template
└── 📄 database.sqlite              # SQLite database file (auto-generated)
\`\`\`

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

### **Authentication Routes**

#### **POST /api/auth/signup**
Create a new user account.

**Request Body:**
\`\`\`json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "patient"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
\`\`\`

#### **POST /api/auth/login**
Login with username or email.

**Request Body:**
\`\`\`json
{
  "usernameOrEmail": "john_doe",
  "password": "securepassword123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
\`\`\`

### **Medication Routes**

#### **GET /api/medications**
Get all medications for the authenticated user.

**Headers:**
\`\`\`
Authorization: Bearer <jwt-token>
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Ibuprofen",
    "dosage": "200mg",
    "frequency": "Twice daily",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
\`\`\`

#### **POST /api/medications**
Add a new medication.

**Request Body:**
\`\`\`json
{
  "name": "Aspirin",
  "dosage": "100mg",
  "frequency": "Once daily"
}
\`\`\`

#### **PUT /api/medications/:id**
Update an existing medication.

#### **DELETE /api/medications/:id**
Delete a medication and its logs.

#### **POST /api/medications/:id/mark-taken**
Mark a medication as taken with optional photo.

**Request Body (multipart/form-data):**
\`\`\`
date: 2024-01-15
photo: [file] (optional)
\`\`\`

#### **GET /api/medications/:id/logs**
Get medication logs for a specific medication.

### **Dashboard Routes**

#### **GET /api/dashboard/stats**
Get dashboard statistics for the authenticated user.

**Response:**
\`\`\`json
{
  "totalMedications": 5,
  "takenToday": 3,
  "adherenceRate": 85,
  "streak": 7,
  "dailyLogs": [
    {
      "taken_at": "2024-01-15",
      "count": 3
    }
  ]
}
\`\`\`

### **Caretaker Routes**

#### **GET /api/caretaker/patients**
Get all patients for the authenticated caretaker.

#### **POST /api/caretaker/patients**
Add a patient to the caretaker's list.

**Request Body:**
\`\`\`json
{
  "patientUsername": "patient_username"
}
\`\`\`

#### **GET /api/caretaker/patients/:patientId/medications**
Get medications for a specific patient.

#### **POST /api/caretaker/patients/:patientId/medications/:medicationId/mark-taken**
Mark a patient's medication as taken.

### **Analytics Routes**

#### **GET /api/analytics/adherence**
Get adherence analytics data.

**Query Parameters:**
- `period`: `week`, `month`, or `year`

**Response:**
\`\`\`json
{
  "adherenceRate": 85,
  "medicationAdherence": [
    {
      "id": 1,
      "name": "Ibuprofen",
      "adherenceRate": 90,
      "totalTaken": 18,
      "expectedTaken": 20
    }
  ],
  "dailyAdherence": [
    {
      "date": "2024-01-15",
      "adherenceRate": 100,
      "taken": 3,
      "total": 3
    }
  ]
}
\`\`\`

### **Upload Routes**

#### **POST /api/uploads/medication-photo**
Upload a medication photo.

**Request Body (multipart/form-data):**
\`\`\`
photo: [file]
medicationLogId: 123
\`\`\`

## 🔄 WebSocket Events

### **Connection & Authentication**
\`\`\`javascript
// Client connects and authenticates
socket.emit('authenticate', jwt_token)

// Server confirms authentication
socket.on('authenticated', { success: true })
\`\`\`

### **Patient Events**
\`\`\`javascript
// Medication added
socket.on('medication_added', {
  id: 1,
  name: "Aspirin",
  dosage: "100mg",
  frequency: "Once daily"
})

// Medication taken
socket.on('medication_taken', {
  medication_id: 1,
  medication_name: "Aspirin",
  taken_at: "2024-01-15"
})

// Caretaker marked medication
socket.on('medication_taken_by_caretaker', {
  medication_name: "Aspirin",
  caretaker_username: "caretaker_name"
})
\`\`\`

### **Caretaker Events**
\`\`\`javascript
// Patient added medication
socket.on('patient_medication_added', {
  patient_username: "john_doe",
  name: "New Medication"
})

// Patient took medication
socket.on('patient_medication_taken', {
  patient_username: "john_doe",
  medication_name: "Aspirin"
})
\`\`\`

## 🔧 Development

### **Available Scripts**

\`\`\`bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
\`\`\`

### **Environment Configuration**

#### **Development (.env)**
\`\`\`env
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key
CLIENT_URL=http://localhost:3000
DATABASE_URL=./database.sqlite
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
\`\`\`

#### **Production (.env)**
\`\`\`env
PORT=5000
NODE_ENV=production
JWT_SECRET=super-secure-production-key
CLIENT_URL=https://your-frontend-domain.com
DATABASE_URL=./database.sqlite
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
\`\`\`

### **Database Management**

#### **Initialize Database**
\`\`\`javascript
const { initializeDatabase } = require('./config/database')
initializeDatabase()
\`\`\`

#### **Reset Database**
\`\`\`bash
# Delete database file
rm database.sqlite

# Restart server (will recreate tables)
npm start
\`\`\`

#### **Backup Database**
\`\`\`bash
# Create backup
cp database.sqlite database_backup_$(date +%Y%m%d).sqlite

# Restore backup
cp database_backup_20240115.sqlite database.sqlite
\`\`\`

## 🔒 Security Features

### **Authentication Middleware**
\`\`\`javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}
\`\`\`

### **Input Validation**
\`\`\`javascript
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.trim().replace(/[<>]/g, '')
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
\`\`\`

### **Rate Limiting**
\`\`\`javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

app.use(limiter)
\`\`\`

### **File Upload Security**
\`\`\`javascript
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})
\`\`\`

## 🧪 Testing

### **Test Structure**
\`\`\`
tests/
├── 📁 unit/
│   ├── 📄 auth.test.js
│   ├── 📄 medications.test.js
│   └── 📄 validation.test.js
├── 📁 integration/
│   ├── 📄 api.test.js
│   └── 📄 socket.test.js
└── 📁 fixtures/
    └── 📄 testData.js
\`\`\`

### **Test Examples**
\`\`\`javascript
const request = require('supertest')
const app = require('../server')

describe('Authentication', () => {
  test('should login with username', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        usernameOrEmail: 'testuser',
        password: 'password123'
      })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
  })

  test('should login with email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        usernameOrEmail: 'test@example.com',
        password: 'password123'
      })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
  })
})
\`\`\`

## 🚀 Deployment

### **Production Build**
\`\`\`bash
# Install production dependencies only
npm ci --only=production

# Set environment variables
export NODE_ENV=production
export JWT_SECRET=your-production-secret

# Start server
npm start
\`\`\`

### **Docker Deployment**
\`\`\`dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
\`\`\`

### **Deployment Platforms**

#### **Heroku**
\`\`\`bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-secret
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

#### **DigitalOcean App Platform**
\`\`\`yaml
name: medication-backend
services:
- name: api
  source_dir: /
  github:
    repo: your-username/medication-management
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-secret-key
\`\`\`

## 📊 Monitoring & Logging

### **Health Check Endpoint**
\`\`\`javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})
\`\`\`

### **Error Logging**
\`\`\`javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})
\`\`\`

## 🐛 Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
\`\`\`bash
# Check if database file exists
ls -la database.sqlite

# Check file permissions
chmod 644 database.sqlite

# Recreate database
rm database.sqlite && npm start
\`\`\`

#### **JWT Token Issues**
\`\`\`javascript
// Verify JWT secret
console.log('JWT_SECRET:', process.env.JWT_SECRET)

// Check token expiration
const decoded = jwt.decode(token)
console.log('Token expires:', new Date(decoded.exp * 1000))
\`\`\`

#### **File Upload Issues**
\`\`\`bash
# Check upload directory permissions
ls -la uploads/
chmod 755 uploads/

# Check disk space
df -h
\`\`\`

#### **Socket Connection Issues**
\`\`\`javascript
// Debug socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, reason)
  })
})
\`\`\`

## 📚 Additional Resources

- **Express.js Documentation**: https://expressjs.com/
- **Socket.io Documentation**: https://socket.io/docs/
- **SQLite Documentation**: https://www.sqlite.org/docs.html
- **JWT Documentation**: https://jwt.io/introduction/
- **Multer Documentation**: https://github.com/expressjs/multer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Update documentation
6. Submit a pull request

### **Coding Standards**
- Use **ES6+** syntax
- Follow **RESTful** API conventions
- Add **JSDoc** comments for functions
- Use **async/await** for asynchronous operations
- Implement proper **error handling**

## 📄 License

MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using Node.js and modern backend technologies**
