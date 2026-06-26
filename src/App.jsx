import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';

// Public pages
import Home from '@/pages/Home/Home';
import About from '@/pages/About/About';
import Skills from '@/pages/Skills/Skills';
import Experience from '@/pages/Experience/Experience';
import Projects from '@/pages/Projects/Projects';
import Education from '@/pages/Education/Education';
import Certificates from '@/pages/Certificates/Certificates';
import Contact from '@/pages/Contact/Contact';

// Auth
import Login from '@/pages/Auth/Login';

// Admin pages
import AdminDashboard from '@/pages/Admin/Dashboard/AdminDashboard';
import AdminProfile from '@/pages/Admin/Profile/AdminProfile';
import AdminSkills from '@/pages/Admin/Skills/AdminSkills';
import AdminExperience from '@/pages/Admin/Experience/AdminExperience';
import AdminProjects from '@/pages/Admin/Projects/AdminProjects';
import AdminEducation from '@/pages/Admin/Education/AdminEducation';
import AdminCertificates from '@/pages/Admin/Certificates/AdminCertificates';
import AdminMessages from '@/pages/Admin/Messages/AdminMessages';
import AdminMessageDetail from '@/pages/Admin/Messages/AdminMessageDetail';
import AdminSettings from '@/pages/Admin/Settings/AdminSettings';

const App = () => (
  <AuthProvider>
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="skills" element={<Skills />} />
        <Route path="experience" element={<Experience />} />
        <Route path="projects" element={<Projects />} />
        <Route path="education" element={<Education />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Auth */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin (protected) */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="experience" element={<AdminExperience />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="education" element={<AdminEducation />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="messages/:id" element={<AdminMessageDetail />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
