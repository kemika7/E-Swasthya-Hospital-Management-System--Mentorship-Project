# E-SWASTHYA Frontend

A production-ready React (Vite) web application for a healthcare management system with Patient, Doctor, and Admin portals.

## Features
- Role-based authentication and protected routes
- Patient login and registration
- Doctor login and registration
- Admin portal with management pages
- Shared responsive auth layout with consistent branding
- Lazy-loaded routes, code-splitting, and soft-shadow UI design

## Tech Stack
- React 18, Vite
- React Router v6
- Context-based auth and domain providers
- React Icons
- Vitest + Testing Library (for unit tests)
- react-helmet-async (SEO)

## Getting Started
1. Install dependencies:
   - `npm install`
2. Environment variables:
   - Copy `.env.example` to `.env` and set values:
     - `VITE_API_BASE_URL=https://api.example.com`
3. Run in development:
   - `npm run dev`
4. Build for production:
   - `npm run build`
5. Preview build:
   - `npm run preview`

## Project Structure
```
src/
  components/
    AuthLayout.jsx
    BrandingHeader.jsx
    Navbar.jsx
    Sidebar.jsx
    ProtectedRoute.jsx
  context/
    AuthContext.jsx
    AdminContext.jsx
    AppointmentContext.jsx
    LockerContext.jsx
  pages/
    Login.jsx
    CreateAccountPatient.jsx
    DoctorRegister.jsx
    NotFound.jsx
    patient/... (dashboard, doctors, etc.)
    doctor/...  (dashboard, analytics, etc.)
    admin/...   (dashboard, management, etc.)
  services/
    apiClient.js
  utils/
    sanitize.js
  __tests__/
    brandingHeader.test.jsx
    authLayout.test.jsx
  styles/
    global.css
```

## Routing
- Implemented using React Router v6
- Lazy-loaded routes in `src/App.jsx`
- ProtectedRoute component guards role-specific paths
- 404 page: `NotFound.jsx`

## State Management
- AuthContext for auth state and role-based navigation
- Additional contexts: Admin, Appointment, Locker
- Avoids prop drilling via context

## Authentication
- Login/logout via AuthContext
- Protected routes based on `userRole`
- For production, prefer server-issued HTTP-only cookies; configure backend to set `Set-Cookie` and read via `credentials: 'include'`

## Backend Integration
- `apiClient.js` with `VITE_API_BASE_URL` and `credentials: 'include'`
- Graceful error handling via exceptions; catch and show UI feedback where appropriate

## UI/UX
- Mobile-first responsive layout
- Shared two-column auth layout with consistent branding
- Rounded inputs/buttons, soft shadows, accessible labels
- Loading states via React Suspense fallback

## SEO
- `react-helmet-async` recommended; wrap app with `HelmetProvider` and set titles/descriptions per page

## Testing
- Unit tests with Vitest + Testing Library:
  - `npm run test`
  - Add more tests in `src/__tests__`

## Performance
- Code splitting via `React.lazy` + `Suspense`
- Image lazy loading in auth layout
- Recommend server compression (gzip/Brotli) and long-lived caching for static assets

## Deployment
- Vercel:
  - Import project, add environment variables
  - Build command: `npm run build`, Output: `dist`
- Netlify:
  - Build command: `npm run build`, Publish directory: `dist`
- Firebase Hosting:
  - `npm run build`, then `firebase deploy` with hosting config
- VPS (Nginx):
  - Serve `dist` as static site
  - Enable gzip/Brotli, cache static assets, route fallback to `index.html`

## Security
- Input sanitization via `utils/sanitize.js`
- Avoid rendering HTML from untrusted sources
- Use HTTPS and secure cookies from backend

## Notes
- Keep UI consistent per design system
- Extend validation and error states as needed
- Follow environment variable best practices for secrets
