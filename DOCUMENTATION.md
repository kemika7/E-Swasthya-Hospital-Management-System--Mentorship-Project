# E-Swasthya Hospital Management System - Documentation

## 1. Project Overview
**E-Swasthya** is a comprehensive, AI-integrated Hospital Management System designed to bridge the gap between patients, doctors, and healthcare institutions. The platform offers a premium user experience with features ranging from simple appointment booking to advanced AI-powered medical report analysis and secure personal document lockers.

---

## 2. Technology Stack

### Frontend (User Interface)
- **Framework**: React.js (v18.3.1)
- **Build Tool**: Vite (v6.0.1)
- **Routing**: React Router DOM (v6.28.0)
- **State Management**: React Context API
- **Data Visualization**: Chart.js & React-Chartjs-2
- **Icons**: React Icons
- **SEO**: React Helmet Async
- **Authentication**: @react-oauth/google (Google Login Integration)

### Backend (Server Side)
- **Runtime**: Node.js
- **Framework**: Express.js (v5.2.1)
- **Authentication**: JSON Web Token (JWT) with `jsonwebtoken`
- **Password Security**: Bcrypt.js (v3.0.3)
- **File Uploads**: Multer
- **Email/OTPs**: Nodemailer
- **API Integration**: Google Auth Library

### Database (Data Persistence)
- **System**: MySQL
- **Driver**: mysql2
- **Schema Management**: Automated schema patching/migrations on server start.

### AI Capabilities
- **Models**: Integration with **Groq SDK** and **OpenAI**.
- **Features**:
    - **SwasthyaAI**: An interactive chatbot for patient guidance and symptom checking.
    - **Report Analysis**: Automated extraction and summarization of data from uploaded PDF medical reports.
    - **Data Extraction**: `pdf-parse` for text extraction from medical documents.

---

## 3. Database Schema

### Core Tables
| Table Name | Description |
| :--- | :--- |
| `users` | Stores accounts for all roles (Patient, Doctor, Admin) with hashed passwords. |
| `patients` | Detailed patient profiles including medical history and contact info. |
| `doctors` | Doctor profiles, specialties, experience, and hospital affiliation. |
| `appointments` | Records of bookings between patients and doctors. |
| `hospitals` | List of medical facilities integrated with the system. |
| `medical_categories`| Grouping of specialties (e.g., Cardiology, Neurology). |

### Health & Documents
- **`patient_health_data`**: Stores metrics like BMI, blood pressure, SPO2, glucose, and lifestyle habits.
- **`patient_reports`**: Stores patient-uploaded reports and the AI-generated analysis/charts.
- **`document_locker`**: A secure table storing hashed MPINs for file protection.
- **`patient_documents`**: Metadata for documents stored in the private locker.

### Workflow & Admin
- **`doctor_requests`**: Tracks leave and schedule change requests from doctors.
- **`doctor_plans`**: Personal task management for doctors.
- **`announcements`**: System-wide notifications managed by Admins.
- **`otps`**: Temporary storage for 6-digit verification codes.

---

## 4. Security Measures

### Authentication & Authorization
- **JWT (JSON Web Token)**: Used for stateless session management. Tokens include user role and ID, ensuring only authorized users access specific routes.
- **Role-Based Access Control (RBAC)**: Middleware validates if a user is a Patient, Doctor, or Admin before granting access to sensitive APIs.
- **Google OAuth**: Secure third-party authentication option for patients.

### Data Protection
- **Password Hashing**: All passwords are salted and hashed using **Bcrypt** (10 salt rounds) before storage.
- **MPIN for Locker**: The private document locker requires a 4-6 digit MPIN, which is stored as a hash to prevent unauthorized access even in case of a DB leak.
- **Input Sanitization**: Backend provides validation for emails, password complexity, and phone numbers.
- **Generic Security Responses**: Password reset flows use generic messaging to prevent "account enumeration" attacks.

### Infrastructure
- **CORS**: Configured to restrict API access to authorized origins.
- **Environment Variables**: Sensitive keys (DB credentials, API keys, JWT secrets) are managed via `.env` files.

---

## 5. System Workflow

### A. Patient Workflow
1. **Registration/Login**: Sign up with email or Google.
2. **Hospital Selection**: Choose a preferred hospital from the landing page.
3. **Department Discovery**: Browse medical categories (e.g., General Medicine, Pediatrics).
4. **Appointment Booking**: Select a doctor, choose a date/time, and book instantly.
5. **Health Tracking**: Input daily vitals (Weight, BP, Sleep) to view progress charts.
6. **Smart Reports**: Upload a PDF report -> AI analyzes it -> View simplified summary and data trends.
7. **Document Locker**: Set an MPIN and securely store ID cards or past prescriptions.

### B. Doctor Workflow
1. **Dashboard**: View upcoming appointments and recent patient interactions.
2. **Report Creation**: Submit formal diagnoses and prescriptions for patients.
3. **Plan Management**: Create a daily checklist of tasks/surgeries.
4. **Requests**: Submit leave or schedule changes for Admin approval.
5. **Accessibility**: Modern UI for managing patient records on the go.

### C. Admin Workflow
1. **User Management**: Oversee all doctors and patients.
2. **Facility Management**: Update hospital details and announcements.
3. **Approval Flow**: Review and approve doctor leave requests.

---

## 6. Directory Structure
```text
/
├── backend/            # Express.js Server
│   ├── config/         # DB Connection
│   ├── middleware/     # Auth & Permissions
│   ├── routes/         # API Endpoints
│   ├── services/       # AI & External Integrations
│   ├── utils/          # Mailer, PDF Parsers
│   └── uploads/        # Local storage for reports/files
├── src/                # React Vite Frontend
│   ├── components/     # Reusable UI Elements (SwasthyaAI, etc.)
│   ├── context/        # Auth & Global State
│   ├── pages/          # Full page views (Dashboard, Login, etc.)
│   ├── services/       # API Calling Logic
│   └── styles/         # Global & Component CSS
└── package.json        # Dependencies & Scripts
```
