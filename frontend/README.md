# 💊 Medication Management System - Frontend

A modern React-based frontend application providing role-based dashboards for patients and caretakers with real-time updates, comprehensive medication tracking, and responsive design.

## 🌟 Features

### 🏥 **Patient Dashboard**
- **Personal Medication Overview** with statistics and progress tracking
- **Medication Management** - Full CRUD operations for medications
- **Photo Upload** - Capture proof when taking medications
- **Adherence Analytics** - Visual charts showing medication compliance
- **Real-time Notifications** - Instant updates from caretakers
- **Responsive Design** - Works seamlessly on all devices

### 👩‍⚕️ **Caretaker Dashboard**
- **Patient Management** - Add and monitor multiple patients
- **Medication Oversight** - View and manage patient medications
- **Real-time Monitoring** - Live updates on patient activities
- **Bulk Actions** - Mark medications as taken for patients
- **Activity Feed** - Track all patient medication activities

### 🔐 **Authentication**
- **Flexible Login** - Sign in with username or email
- **Secure Registration** - Role-based account creation
- **JWT Token Management** - Automatic token refresh and logout
- **Protected Routes** - Role-based access control

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone and navigate to frontend:**
\`\`\`bash
git clone <repository-url>
cd medication-management-system/frontend
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
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
\`\`\`

5. **Start the development server:**
\`\`\`bash
npm start
\`\`\`

6. **Open your browser:**
Navigate to `http://localhost:3000`

## 📁 Project Structure

\`\`\`
src/
├── 📁 components/
│   ├── 📁 Auth/                    # Authentication components
│   │   ├── 📄 Login.js            # Login form with username/email support
│   │   ├── 📄 Signup.js           # Registration form
│   │   └── 📄 Auth.css            # Authentication styles
│   ├── 📁 Dashboard/               # Dashboard components
│   │   ├── 📄 PatientDashboard.js # Patient main dashboard
│   │   ├── 📄 CaretakerDashboard.js # Caretaker main dashboard
│   │   ├── 📄 Header.js           # Navigation header
│   │   ├── 📄 StatsCards.js       # Statistics display cards
│   │   ├── 📄 MedicationList.js   # Medication list component
│   │   ├── 📄 PatientList.js      # Patient list for caretakers
│   │   ├── 📄 AddMedicationModal.js # Add medication modal
│   │   ├── 📄 EditMedicationModal.js # Edit medication modal
│   │   ├── 📄 MedicationDetailsModal.js # Medication details modal
│   │   ├── 📄 PhotoUploadModal.js # Photo upload modal
│   │   ├── 📄 AddPatientModal.js  # Add patient modal
│   │   ├── 📄 PatientMedicationsModal.js # Patient medications modal
│   │   └── 📄 Dashboard.css       # Dashboard styles
│   ├── 📁 Analytics/               # Analytics components
│   │   ├── 📄 AdherenceAnalytics.js # Adherence charts and stats
│   │   └── 📄 AdherenceAnalytics.css # Analytics styles
│   └── 📁 UI/                      # Reusable UI components
│       ├── 📄 Button.js           # Custom button component
│       ├── 📄 FormInput.js        # Form input component
│       ├── 📄 LoadingSpinner.js   # Loading spinner
│       ├── 📄 ErrorMessage.js     # Error message component
│       └── 📄 [component].css     # Component-specific styles
├── 📁 contexts/
│   └── 📄 AuthContext.js          # Authentication context
├── 📁 services/
│   ├── 📄 api.js                  # API service functions
│   └── 📄 socket.js               # WebSocket service
├── 📄 App.js                      # Main application component
├── 📄 App.css                     # Global styles
└── 📄 index.js                    # Application entry point
\`\`\`

## 🎨 Component Architecture

### **Authentication Flow**
\`\`\`jsx
App
├── AuthProvider (Context)
├── Router
    ├── PublicRoute (Login/Signup)
    └── ProtectedRoute
        └── DashboardRouter
            ├── PatientDashboard (role: patient)
            └── CaretakerDashboard (role: caretaker)
\`\`\`

### **Key Components**

#### **AuthContext**
\`\`\`jsx
const { user, login, signup, logout, loading, error } = useAuth()
\`\`\`
- Manages authentication state
- Handles login with username or email
- Provides user data throughout the app
- Manages JWT tokens

#### **PatientDashboard**
\`\`\`jsx
<PatientDashboard />
\`\`\`
- Personal medication overview
- Statistics cards (total meds, taken today, adherence rate)
- Medication list with actions
- Real-time notifications
- Photo upload functionality

#### **CaretakerDashboard**
\`\`\`jsx
<CaretakerDashboard />
\`\`\`
- Patient list management
- Patient medication oversight
- Real-time patient activity monitoring
- Bulk medication management

#### **MedicationList**
\`\`\`jsx
<MedicationList 
  medications={medications}
  onMarkAsTaken={handleMarkAsTaken}
  onMarkAsTakenWithPhoto={handleMarkAsTakenWithPhoto}
  onEdit={handleEdit}
  onViewDetails={handleViewDetails}
/>
\`\`\`

## 🔌 API Integration

### **Authentication API**
\`\`\`javascript
// Login with username or email
const response = await authAPI.login(usernameOrEmail, password)

// Signup
const response = await authAPI.signup(username, email, password, role)
\`\`\`

### **Medication API**
\`\`\`javascript
// Get medications
const medications = await medicationAPI.getMedications()

// Add medication
const newMed = await medicationAPI.addMedication(medicationData)

// Mark as taken with photo
await medicationAPI.markAsTaken(medicationId, date, photoFile)
\`\`\`

### **Real-time Updates**
\`\`\`javascript
// Listen for medication updates
socketService.on('medication_added', (medication) => {
  // Update UI
})

// Listen for caretaker notifications
socketService.on('medication_taken_by_caretaker', (data) => {
  // Show notification
})
\`\`\`

## 🎨 Styling & Design

### **Design System**
- **Color Palette**: Blue primary (#3b82f6), Green success (#10b981), Red danger (#ef4444)
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth transitions and hover effects

### **CSS Architecture**
\`\`\`css
/* Global styles in App.css */
.btn { /* Base button styles */ }
.btn-primary { /* Primary button variant */ }
.btn-small { /* Size modifier */ }

/* Component-specific styles */
.medication-card { /* Medication card styles */ }
.patient-list { /* Patient list styles */ }
\`\`\`

### **Responsive Design**
\`\`\`css
/* Mobile-first approach */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

## 📱 Features in Detail

### **Photo Upload**
- **Drag & Drop** file selection
- **Image Preview** before upload
- **File Validation** (size, type)
- **Progress Indicators** during upload
- **Error Handling** for failed uploads

### **Real-time Notifications**
\`\`\`jsx
const [notifications, setNotifications] = useState([])

const addNotification = (message) => {
  const id = Date.now()
  setNotifications(prev => [...prev, { id, message }])
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, 5000)
}
\`\`\`

### **Adherence Analytics**
- **Period Selection** (week, month, year)
- **Visual Charts** using CSS and JavaScript
- **Medication-specific** adherence rates
- **Daily Adherence** bar charts
- **Export Functionality** (planned)

### **Modal Management**
\`\`\`jsx
const [showModal, setShowModal] = useState(false)
const [selectedItem, setSelectedItem] = useState(null)

const handleEdit = (item) => {
  setSelectedItem(item)
  setShowModal(true)
}
\`\`\`

## 🔧 Development

### **Available Scripts**

\`\`\`bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Eject from Create React App (irreversible)
npm run eject
\`\`\`

### **Code Quality**

#### **ESLint Configuration**
\`\`\`json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
\`\`\`

#### **Component Guidelines**
\`\`\`jsx
// Use functional components with hooks
function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue)
  
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  return (
    <div className="my-component">
      {/* JSX */}
    </div>
  )
}

export default MyComponent
\`\`\`

### **State Management Patterns**

#### **Local State**
\`\`\`jsx
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [data, setData] = useState([])
\`\`\`

#### **Context State**
\`\`\`jsx
const { user, login, logout } = useAuth()
\`\`\`

#### **Form State**
\`\`\`jsx
const [formData, setFormData] = useState({
  name: '',
  dosage: '',
  frequency: ''
})

const handleChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({
    ...prev,
    [name]: value
  }))
}
\`\`\`

## 🧪 Testing

### **Test Structure**
\`\`\`
src/
├── 📁 __tests__/
│   ├── 📄 App.test.js
│   ├── 📄 Login.test.js
│   └── 📄 Dashboard.test.js
└── 📁 components/
    └── 📁 __tests__/
        ├── 📄 Button.test.js
        └── 📄 MedicationList.test.js
\`\`\`

### **Testing Examples**
\`\`\`jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthProvider } from '../contexts/AuthContext'
import Login from '../components/Auth/Login'

test('renders login form', () => {
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  )
  
  expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
})
\`\`\`

## 🚀 Deployment

### **Build for Production**
\`\`\`bash
npm run build
\`\`\`

### **Environment Variables for Production**
\`\`\`env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SOCKET_URL=https://your-api-domain.com
REACT_APP_ENV=production
\`\`\`

### **Deployment Platforms**

#### **Vercel (Recommended)**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

<<<<<<< HEAD
#### **Netlify**
1. Build command: `npm run build`
2. Publish directory: `build`
3. Set environment variables
=======
>>>>>>> 95b7d92b12e72fa21c92144d239259952a29021a

#### **AWS S3 + CloudFront**
\`\`\`bash
# Build the app
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
\`\`\`

## 🔍 Performance Optimization

### **Code Splitting**
\`\`\`jsx
import { lazy, Suspense } from 'react'

const Analytics = lazy(() => import('./components/Analytics/AdherenceAnalytics'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Analytics />
    </Suspense>
  )
}
\`\`\`

### **Image Optimization**
\`\`\`jsx
// Lazy loading images
<img 
  src={imageUrl || "/placeholder.svg"} 
  alt="Description"
  loading="lazy"
  onError={(e) => {
    e.target.src = '/placeholder.svg'
  }}
/>
\`\`\`

### **Bundle Analysis**
\`\`\`bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
\`\`\`

## 🐛 Troubleshooting

### **Common Issues**

#### **API Connection Issues**
\`\`\`javascript
// Check if backend is running
fetch('http://localhost:5000/health')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Backend not running:', error))
\`\`\`

#### **Socket Connection Issues**
\`\`\`javascript
// Debug socket connection
socketService.socket.on('connect', () => {
  console.log('Socket connected')
})

socketService.socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error)
})
\`\`\`

#### **Authentication Issues**
\`\`\`javascript
// Check token in localStorage
console.log('Token:', localStorage.getItem('token'))
console.log('User:', localStorage.getItem('user'))

// Clear auth data
localStorage.removeItem('token')
localStorage.removeItem('user')
\`\`\`

## 📚 Additional Resources

- **React Documentation**: https://reactjs.org/docs
- **React Router**: https://reactrouter.com/docs
- **Axios Documentation**: https://axios-http.com/docs
- **Socket.io Client**: https://socket.io/docs/v4/client-api/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the component guidelines
4. Add tests for new features
5. Update documentation
6. Submit a pull request

## 📄 License

MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using React and modern web technologies**
