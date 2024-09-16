import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import History from './pages/History';
import './styles/global.css';

const App: React.FC = () => {
  const { user, signIn } = useAuth();

  if (!user) {
    return (
      <div className="container">
        <h1>Welcome to the Financial Tracker</h1>
        <button onClick={signIn}>Sign In Anonymously</button>
      </div>
    );
  }

  return (
    <Router>
      <div>
        <nav className="nav-menu">
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/reports">View Reports</Link></li>
            <li><Link to="/history">History</Link></li>
          </ul>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
