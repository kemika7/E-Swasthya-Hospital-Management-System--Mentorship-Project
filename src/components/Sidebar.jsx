import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiLock,
  FiActivity,
  FiCpu,
  FiBarChart2,
  FiUploadCloud,
  FiMessageSquare,
} from 'react-icons/fi';
import { FaCalendarCheck } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const linkBaseStyle = ({ isActive }) =>
  [
    'sidebar-link',
    isActive ? 'active' : '',
  ]
    .filter(Boolean)
    .join(' ');

const doctorLinkStyle = ({ isActive }) =>
  [
    'doctor-sidebar-link',
    isActive ? 'doctor-sidebar-link-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

export const PatientSidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" style={{ height: 32 }} />
        <span>E-SWASTHYA</span>
      </div>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/patient" end className={linkBaseStyle}>
            <FiHome size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/doctors" className={linkBaseStyle}>
            <FiUsers size={20} />
            <span>Medical Categories</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/appointments" className={linkBaseStyle}>
            <FiCalendar size={20} />
            <span>Appointments</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/reports" className={linkBaseStyle}>
            <FiActivity size={20} />
            <span>Health Tracker</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/patient-reports" className={linkBaseStyle}>
            <FiUploadCloud size={20} />
            <span>My Reports</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/locker" className={linkBaseStyle}>
            <FiLock size={20} />
            <span>Document Locker</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/chatbot" className={linkBaseStyle}>
            <FiMessageSquare size={20} />
            <span>Swasthya AI</span>
          </NavLink>
        </li>

      </ul>
    </aside>
  );
};

export const DoctorSidebar = () => {
  return (
    <aside className="doctor-sidebar">
      <div className="doctor-sidebar-logo">
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </div>
      <ul className="doctor-sidebar-nav">
        <li>
          <NavLink to="/doctor" end className={doctorLinkStyle}>
            <FiHome size={22} />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/doctor/analytics" className={doctorLinkStyle}>
            <FiBarChart2 size={22} />
            <span>Analytics</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/doctor/calendar" className={doctorLinkStyle}>
            <FiCalendar size={22} />
            <span>Calendar</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/doctor/appointments" className={doctorLinkStyle}>
            <FaCalendarCheck size={22} />
            <span>Appointments</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/doctor/report" className={doctorLinkStyle}>
            <FiFileText size={22} />
            <span>Patient Reports</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export const AdminSidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" style={{ height: 32 }} />
        <span>Admin Panel</span>
      </div>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/admin" end className={linkBaseStyle}>
            <FiHome size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/doctors" className={linkBaseStyle}>
            <FiUsers size={20} />
            <span>Doctors</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/patients" className={linkBaseStyle}>
            <FiUser size={20} />
            <span>Patients</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/appointments" className={linkBaseStyle}>
            <FiCalendar size={20} />
            <span>Appointments</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/transactions" className={linkBaseStyle}>
            <FiDollarSign size={20} />
            <span>Transactions</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default PatientSidebar;
