# Medication Management System - Frontend

A React-based frontend application for the Medication Management System, providing role-based dashboards for patients and caretakers with real-time updates and comprehensive medication tracking.

## Features

### 🏥 **Patient Features**
- **Personal Dashboard**: Overview of medications, adherence stats, and daily progress
- **Medication Management**: Add, edit, delete, and track medications
- **Photo Proof**: Upload photos when marking medications as taken
- **Adherence Analytics**: Detailed charts and statistics
- **Real-time Notifications**: Instant updates from caretakers
- **Responsive Design**: Works on desktop, tablet, and mobile

### 👩‍⚕️ **Caretaker Features**
- **Patient Management**: Add and monitor multiple patients
- **Medication Oversight**: View patient medications and mark as taken
- **Real-time Monitoring**: Live updates when patients take medications
- **Patient Activity**: Track patient adherence and medication changes
- **Centralized Dashboard**: Manage all patients from one interface

### 🔐 **Authentication**
- **Secure Login/Signup**: JWT-based authentication
- **Role-based Access**: Different interfaces for patients and caretakers
- **Session Management**: Automatic token refresh and logout

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Styling**: CSS3 with CSS Grid and Flexbox
- **State Management**: React Context API
- **Build Tool**: Create React App

## Installation

1. **Clone the repository:**
\`\`\`bash
git clone <repository-url>
cd medication-management-frontend
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

3. **Create environment file:**
\`\`\`bash
cp .env.example .env
\`\`\`

4. **Update the `.env` file:**
\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
\`\`\`

5. **Start the development server:**
\`\`\`bash
npm start
\`\`\`

The application will open at `http://localhost:3000`

## Project Structure

\`\`\`
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── Auth.css
│   ├── Dashboard/
│   │   ├── PatientDashboard.js
│   │   ├── CaretakerDashboard.js
│   │   ├── Header.js
│   │   ├── StatsCards.js
│   │   ├── MedicationList.js
│   │   ├── PatientList.js
│   │   ├── AddMedicationModal.js
│   │   ├── EditMedicationModal.js
│   │   ├── MedicationDetailsModal.js
│   │   ├── PhotoUploadModal.js
│   │   ├── AddPatientModal.js
│   │   ├── PatientMedicationsModal.js
│   │   └── Dashboard.css
│   ├── Analytics/
│   │   ├── AdherenceAnalytics.js
│   │   └── AdherenceAnalytics.css
│   └── UI/
│       ├── Button.js
│       ├── FormInput.js
│       ├── LoadingSpinner.js
│       ├── ErrorMessage.js
│       └── [component].css
├── contexts/
│   └── AuthContext.js
├── services/
│   ├── api.js
│   └── socket.js
├── App.js
├── App.css
└── index.js
\`\`\`

## Key Components

### **Authentication Context**
- Manages user authentication state
- Handles login, signup, and logout
- Provides user data throughout the app

### **Patient Dashboard**
- Displays medication overview and statistics
- Allows medication CRUD operations
- Shows real-time notifications
- Integrates photo upload functionality

### **Caretaker Dashboard**
- Lists managed patients
- Provides patient medication oversight
- Enables marking medications as taken for patients
- Shows patient activity notifications

### **Analytics Component**
- Displays adherence charts and statistics
- Supports different time periods (week, month, year)
- Shows per-medication and daily adherence data

## API Integration

The frontend communicates with the backend through:

### **REST API Endpoints**
- Authentication: `/api/auth/login`, `/api/auth/signup`
- Medications: `/api/medications/*`
- Dashboard: `/api/dashboard/stats`
- Caretaker: `/api/caretaker/*`
- Analytics: `/api/analytics/*`
- Uploads: `/api/uploads/*`

### **WebSocket Events**
- Real-time medication updates
- Patient-caretaker notifications
- Live adherence tracking

## Features in Detail

### **Role-Based Routing**
- Automatic redirection based on user role
- Protected routes requiring authentication
- Public routes for login/signup

### **Real-Time Updates**
- Socket.io integration for live updates
- Automatic reconnection handling
- Event-based state updates

### **Photo Upload**
- Drag-and-drop file selection
- Image preview before upload
- File size and type validation
- Optional photo proof for medications

### **Responsive Design**
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_SOCKET_URL` | WebSocket server URL | `http://localhost:5000` |
| `REACT_APP_ENV` | Environment | `development` |

## Building for Production

1. **Build the application:**
\`\`\`bash
npm run build
\`\`\`

2. **The build folder contains the optimized production files**

## Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### **Netlify**
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables

### **Traditional Hosting**
1. Build the application: `npm run build`
2. Upload the `build` folder contents to your web server
3. Configure your server to serve `index.html` for all routes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
\`\`\`

This complete frontend update includes:

## ✅ **Fixed Issues:**
1. **Role-based routing** - Proper dashboard routing based on user role
2. **onEdit function error** - Fixed by properly passing the function to MedicationList
3. **Complete component structure** - All missing components added
4. **Proper state management** - Fixed all state handling issues

## 🎯 **Key Features:**
- **Patient Dashboard**: Personal medication management with photo upload
- **Caretaker Dashboard**: Patient management and oversight
- **Real-time notifications** with close functionality
- **Photo upload modal** for medication proof
- **Responsive design** for all devices
- **Error handling** and loading states
- **Analytics component** with charts and statistics

## 🔧 **Technical Improvements:**
- **Proper routing** with role-based redirection
- **Socket.io integration** for real-time updates
- **File upload handling** with validation
- **Notification system** with auto-dismiss
- **Modal management** with proper state cleanup
- **CSS improvements** with animations and hover effects

The frontend is now complete and properly handles both patient and caretaker roles with all the functionality specified in your reference document!
