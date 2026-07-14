import { useState, useEffect } from 'react';
import { ActivePage, UserProfile } from './types';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProfileSettings from './components/ProfileSettings';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // 1. Session Checker (Authentication Listener) Auto-Redirect Logic
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('guardiantrack_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as UserProfile;
        setCurrentUser(parsed);
        // If logged in, automatically redirect to dashboard
        setActivePage('dashboard');
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Handle successful 3-key login
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('guardiantrack_session', JSON.stringify(user));
    setActivePage('dashboard');
  };

  // Handle student configuration / contacts update
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('guardiantrack_session', JSON.stringify(updatedUser));
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('guardiantrack_session');
    setActivePage('landing');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white text-blue-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold tracking-wider uppercase text-blue-500">Securing Satellite Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-blue-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Route Views */}
      {activePage === 'landing' && (
        <LandingPage 
          onNavigate={setActivePage} 
          currentUser={currentUser} 
        />
      )}

      {activePage === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onNavigate={setActivePage} 
        />
      )}

      {activePage === 'dashboard' && currentUser && (
        <Dashboard 
          currentUser={currentUser}
          onNavigate={setActivePage}
          onLogout={handleLogout}
        />
      )}

      {activePage === 'settings' && currentUser && (
        <ProfileSettings 
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onNavigate={setActivePage}
        />
      )}

    </div>
  );
}
