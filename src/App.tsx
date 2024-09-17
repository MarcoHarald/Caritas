import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { translations } from './utils/translations';
import LandingPage from './components/LandingPage';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import History from './pages/History';
import Lending from './pages/Lending';
import VolunteerTracking from './pages/VolunteerTracking';
import './styles/global.css';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'it')}
      className="bg-blue-500 text-white px-2 py-1 rounded"
    >
      <option value="en">English</option>
      <option value="it">Italiano</option>
    </select>
  );
};

const AppContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to landing page or show a message
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Router>
      {!user ? (
        <LandingPage />
      ) : (
        <div>
          <nav className="nav-menu bg-blue-600 text-white py-4">
            <div className="container mx-auto flex justify-between items-center">
              <ul className="flex space-x-4">
                <li><Link to="/" className="hover:text-blue-200">{t.dashboard}</Link></li>
                <li><Link to="/reports" className="hover:text-blue-200">{t.viewReports}</Link></li>
                <li><Link to="/history" className="hover:text-blue-200">{t.history}</Link></li>
                <li><Link to="/lending" className="hover:text-blue-200">{t.lending}</Link></li>
                <li><Link to="/volunteers" className="hover:text-blue-200">{t.volunteers}</Link></li>
              </ul>
              <div className="flex items-center space-x-4">
                <LanguageToggle />
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          </nav>

          <div className="container mx-auto mt-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/history" element={<History />} />
              <Route path="/lending" element={<Lending />} />
              <Route path="/volunteers" element={<VolunteerTracking />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
