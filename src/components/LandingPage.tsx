import { useEffect } from 'react';
import { Shield, Map, Key, Eye, HelpCircle, ArrowRight } from 'lucide-react';
import { ActivePage, UserProfile } from '../types';

interface LandingPageProps {
  onNavigate: (page: ActivePage) => void;
  currentUser: UserProfile | null;
}

export default function LandingPage({ onNavigate, currentUser }: LandingPageProps) {
  // 1. Session Checker (Authentication Listener) Auto-Redirect Logic
  useEffect(() => {
    if (currentUser) {
      // If user is logged in, immediately redirect to dashboard
      onNavigate('dashboard');
    }
  }, [currentUser, onNavigate]);

  // If already logged in, show a blank loader briefly while the redirect takes effect
  if (currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-blue-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-tight">Checking active session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-blue-900 flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-blue-50 py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="font-bold tracking-tight text-lg text-blue-900">Beacon</span>
          </div>
          <button 
            onClick={() => onNavigate('login')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              Professional Grade Hardware Sync
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-blue-900 leading-tight">
              High-Precision Student Tracking. <br />
              <span className="text-blue-600 font-extrabold">Absolute Parent Peace of Mind.</span>
            </h1>
            <p className="text-base md:text-lg text-blue-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Ensure your child's physical transit remains fully visible and secured. Backed by standard 3-Key Secondary Authentication binding hardware directly to parental controls.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>Access Command Center</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 text-left border-t border-blue-50">
            
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">3-Key Authentication</h3>
              <p className="text-sm text-blue-600 leading-relaxed font-medium">
                Hardened security framework utilizing Email, Password, and a registered physical Chip ID to bind location feeds.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">Satellite Command Center</h3>
              <p className="text-sm text-blue-600 leading-relaxed font-medium">
                Pulls real-time coordinates on a zero-reload Single Page Interface featuring direct satellite tracking layouts.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">Dual-Parent Redundancy</h3>
              <p className="text-sm text-blue-600 leading-relaxed font-medium">
                Eliminates delivery failure. Coordinates alerts directly to both Father's and Mother's registered emails simultaneously.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-50 py-6 px-6 text-center text-xs text-blue-500 font-semibold bg-white">
        <p>© 2026 Beacon Safety Systems. All rights reserved.</p>
      </footer>

    </div>
  );
}
