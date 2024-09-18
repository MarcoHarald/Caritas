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
import GiftedItems from './pages/GiftedItems';
import DisposedTrash from './pages/DisposedTrash';
import VolunteerTracking from './pages/VolunteerTracking';
import './styles/global.css';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'it')}
      className="bg-white text-gray-800 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-2xl font-semibold text-blue-600">CharityAdmin</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {[
                      { to: "/", label: t.dashboard },
                      { to: "/reports", label: t.viewReports },
                      { to: "/history", label: t.history },
                      { to: "/lending", label: t.lending },
                      { to: "/gifted-items", label: t.giftedItems },
                      { to: "/disposed-trash", label: t.disposedTrash },
                      { to: "/volunteers", label: t.volunteers },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition duration-150 ease-in-out"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <LanguageToggle />
                  <button
                    onClick={handleLogout}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t.logout}
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="py-10">
            <main>
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                  <div className="p-6 bg-white border-b border-gray-200">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/lending" element={<Lending />} />
                      <Route path="/gifted-items" element={<GiftedItems />} />
                      <Route path="/disposed-trash" element={<DisposedTrash />} />
                      <Route path="/volunteers" element={<VolunteerTracking />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </main>
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
