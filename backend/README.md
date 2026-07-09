# 🏥 ClinicAI — AI-Powered Clinic Management SaaS

> Built for Saylani Mass IT Training Hackathon — Final MERN Track

A full-stack AI-powered clinic management system that digitizes clinic operations, improves efficiency, and provides intelligent AI assistance to doctors.

---

## 🔗 Live Demo

- **Frontend:** https://clinic-frontend-lime.vercel.app
- **Backend API:** https://clinic-backend-lake.vercel.app/api/health

---

## 🎥 Demo Video

> [Add your YouTube/LinkedIn video link here]

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manage doctors & staff, view analytics, monitor system |
| **Doctor** | View appointments, write prescriptions, AI diagnosis, patient history |
| **Receptionist** | Register patients, book appointments, manage schedule |
| **Patient** | View appointments, download prescriptions, book appointments |

### Demo Accounts
```
Admin:        ali@test.com       / 123456
Doctor:       doctor@test.com    / 123456
Receptionist: sara@test.com      / 123456
Patient:      Register at /register
```

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure login
- Role-based dashboards
- Protected routes per role
- Password hashing with bcryptjs

### 🧑‍🤝‍🧑 Patient Management
- Add, edit, view patients
- Auto-create patient record on self-registration
- Medical history timeline (appointments + prescriptions + AI logs)

### 📅 Appointment Management
- Book appointments (receptionist or patient)
- Update status: pending → confirmed → completed
- Cancel appointments
- Doctor schedule view

### 💊 Prescription System
- Add medicines with dosage and duration
- Add instructions
- Generate & download PDF
- Patient can view and print prescriptions

### 🤖 AI Features (Powered by Groq — LLaMA 3.3 70B)
- **Smart Symptom Checker** — Doctor enters symptoms, AI returns possible conditions, risk level, suggested tests
- **Graceful fallback** — System works normally if AI fails
- **Diagnosis logging** — All AI results saved to database

### 📊 Analytics Dashboard
- Total patients, doctors, appointments
- Monthly appointments bar chart
- Appointment status pie chart
- User roles distribution
- Patient gender breakdown

---

## 🛠 Tech Stack

### Frontend
- React.js 19 + Vite
- Tailwind CSS
- React Router DOM v7
- Axios
- Recharts (analytics)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Groq SDK (AI — LLaMA 3.3 70B)

### Deployment
- Frontend: Vercel
- Backend: Vercel
- Database: MongoDB Atlas

---

## 🗂 Database Structure

```
Users         → id, name, email, password, role, subscriptionPlan
Patients      → id, name, age, gender, contact, createdBy, userId
Appointments  → id, patientId, doctorId, date, status
Prescriptions → id, patientId, doctorId, medicines[], instructions
DiagnosisLogs → id, patientId, doctorId, symptoms, aiResponse, riskLevel
```

---

## 🔌 API Endpoints

### 🔐 Auth Routes `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user. Accepts name, email, password, role. If role is `patient`, automatically creates a Patient record linked to the user account. Returns JWT token + user info with role. |
| POST | `/login` | Public | Login with email and password. Validates credentials, compares bcrypt hashed password. Returns JWT token with role embedded inside — frontend reads role and redirects to correct dashboard. |
| GET | `/profile` | Private | Returns the currently logged-in user's profile. Called by AuthContext on every page load to restore session from token stored in localStorage. |
| GET | `/users` | Private | Returns all users. Accepts optional `?role=doctor` query to filter by role. Used by receptionist to populate doctor dropdown when booking appointments. |

---

### 🧑‍🤝‍🧑 Patient Routes `/api/patients`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Receptionist, Admin | Create a new patient record with name, age, gender, contact. The `createdBy` field is auto-set to the logged-in receptionist's ID. |
| GET | `/` | All roles | Fetch all patients. Used by receptionist for patient list, doctor for selecting patients in prescriptions, admin for overview. |
| GET | `/my` | Patient | Fetch the Patient record linked to the logged-in patient via `userId` field. Patient uses this to get their own `_id` for booking appointments. |
| GET | `/:id` | All roles | Fetch a single patient by ID with full details. |
| PUT | `/:id` | Receptionist, Admin | Update patient info. Used to fix missing fields for self-registered patients who only have email as contact. |
| GET | `/:id/timeline` | Private | Fetch complete medical history for a patient — returns all appointments, prescriptions, and AI diagnosis logs sorted by date. Used by doctor for full patient history view. |

---

### 📅 Appointment Routes `/api/appointments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Receptionist, Admin, Patient | Book a new appointment with patientId, doctorId, date. Status defaults to `pending`. Patients can book their own appointments once their record exists. |
| GET | `/` | All roles | Returns appointments filtered by role. Doctors see only their appointments. Patients see only theirs (matched via userId → patientId). Admin and receptionist see all. |
| PUT | `/:id/status` | Doctor, Admin | Update appointment status. Drives the workflow: `pending → confirmed → completed`. Only doctors and admins can change status. |
| PUT | `/:id/cancel` | All roles | Sets appointment status to `cancelled`. Receptionist can cancel on behalf of patient. |

---

### 💊 Prescription Routes `/api/prescriptions`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Doctor only | Create a prescription with patientId, medicines array (name, dosage, duration), and instructions. The doctorId is auto-set from the logged-in doctor's JWT token. |
| GET | `/my` | Patient | Fetch all prescriptions for the logged-in patient. Finds patient record by userId then returns all prescriptions for that patientId. Used for patient's prescription view and PDF download. |
| GET | `/patient/:patientId` | All roles | Fetch all prescriptions for a specific patient by their Patient record ID. Used by doctor when reviewing patient history. |
| GET | `/:id` | All roles | Fetch a single prescription with full doctor and patient details populated. Used for PDF generation. |

---

### 🤖 AI Routes `/api/ai`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/symptom-check` | Doctor only | Sends symptoms, age, gender, medical history to Groq AI (LLaMA 3.3 70B). AI returns possible conditions, risk level (low/medium/high), suggested tests, and advice in JSON. Result saved to DiagnosisLog. If AI fails, returns a graceful fallback response — system never crashes. |

---

## 🚀 Run Locally

### Backend
```bash
git clone https://github.com/AleyJan/clinic-backend
cd clinic-backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_key
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend
```bash
git clone https://github.com/AleyJan/clinic-frontend
cd clinic-frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                     → MongoDB Atlas connection
├── controllers/
│   ├── authController.js         → Register, login, get profile, get users
│   ├── patientController.js      → Patient CRUD + timeline
│   ├── appointmentController.js  → Booking, status updates, role filtering
│   ├── prescriptionController.js → Create + fetch prescriptions
│   └── aiController.js           → Groq AI symptom checker
├── middleware/
│   └── authMiddleware.js         → JWT protect middleware + allowRoles checker
├── models/
│   ├── User.js                   → role enum: admin/doctor/receptionist/patient
│   ├── Patient.js                → userId field links patient record to user account
│   ├── Appointment.js            → status enum: pending/confirmed/completed/cancelled
│   ├── Prescription.js           → medicines[] subdocument array
│   └── DiagnosisLog.js           → AI result storage per patient
├── routes/
│   ├── authRoutes.js
│   ├── patientRoutes.js
│   ├── appointmentRoutes.js
│   ├── prescriptionRoutes.js
│   └── aiRoutes.js
└── server.js                     → Express app, CORS, middleware, route registration

client/src/
├── components/shared/
│   ├── Sidebar.jsx               → Tab-based navigation, role label, logout
│   ├── Layout.jsx                → Sidebar + main content area wrapper
│   └── StatCard.jsx              → Reusable glassmorphic stat card
├── context/
│   ├── AuthContext.jsx           → Provides user state + login/logout functions
│   └── useAuth.js                → Custom hook to consume AuthContext
├── pages/
│   ├── auth/
│   │   ├── Login.jsx             → Login with demo account hints
│   │   └── Register.jsx          → Patient self-registration (role=patient default)
│   ├── admin/
│   │   └── AdminDashboard.jsx    → Overview, patients, appointments, add staff, analytics charts
│   ├── doctor/
│   │   └── DoctorDashboard.jsx   → Appointments, prescriptions, AI diagnosis, patient timeline
│   ├── receptionist/
│   │   └── ReceptionistDashboard.jsx → Patient list, add patient, appointments, book appointment
│   └── patient/
│       └── PatientDashboard.jsx  → Profile, appointments, prescriptions + PDF, book appointment
├── services/
│   └── api.js                    → Axios with baseURL + JWT auto-attach interceptor
└── App.jsx                       → Routes + RoleRedirect component
```

---

## 🔒 Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens expire in 30 days
- Role checked server-side on every protected route
- `.env` never committed to GitHub
- CORS configured for specific frontend origins only
- Input validation on all forms

---

## 👨‍💻 Built By

**Ali Jan** — Final MERN Hackathon
Saylani Mass IT Training Program

---

## 📄 License

MIT
