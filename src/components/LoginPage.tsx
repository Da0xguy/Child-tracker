import React, { useState } from 'react';
import { Shield, Key, Mail, Lock, Cpu, Eye, EyeOff, Info, ArrowLeft } from 'lucide-react';
import { ActivePage, UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (page: ActivePage) => void;
}

export default function LoginPage({ onLoginSuccess, onNavigate }: LoginPageProps) {
  // Demo credentials
  const DEMO_EMAIL = "parent@guardian.com";
  const DEMO_CHIP_ID = "CHIP-7729";
  const DEMO_PASSWORD = "password123";

  const [email, setEmail] = useState('');
  const [chipId, setChipId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePrefillDemo = () => {
    setEmail(DEMO_EMAIL);
    setChipId(DEMO_CHIP_ID);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !chipId.trim() || !password) {
      setError('Please fill in all three authentication fields.');
      return;
    }

    setIsLoading(true);

    // Simulate database lookup network latency
    setTimeout(() => {
      setIsLoading(false);
      // Validate credentials (both exact match or allow demo)
      const isEmailValid = email.toLowerCase().trim() === DEMO_EMAIL.toLowerCase();
      const isChipValid = chipId.trim().toUpperCase() === DEMO_CHIP_ID;
      const isPasswordValid = password === DEMO_PASSWORD;

      if (isEmailValid && isPasswordValid && isChipValid) {
        // Success
        const loggedUser: UserProfile = {
          studentName: "Benjamin Tyler",
          fatherEmail: "father.tyler@guardian.com",
          motherEmail: "mother.tyler@guardian.com",
          chipId: DEMO_CHIP_ID,
          email: DEMO_EMAIL
        };
        onLoginSuccess(loggedUser);
      } else {
        // Build clear explanatory error messages for demo
        if (!isEmailValid || !isPasswordValid) {
          setError('Invalid Email or Password. (Check the demo prefill below)');
        } else if (!isChipValid) {
          setError('Secondary Authentication Failed: Chip ID does not match the assigned device for this user.');
        } else {
          setError('Authentication failed. Please verify your credentials.');
        }
      }
    }, 750);
  };

  return (
    <div className="min-h-screen bg-white text-blue-900 flex flex-col justify-between">
      
      {/* Top Navigation */}
      <header className="py-5 px-6 border-b border-blue-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold tracking-tight text-sm text-blue-900">Beacon</span>
          </div>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-white rounded-xl border border-blue-100 p-8 space-y-6">
          
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-blue-900">3-Key Authentication</h2>
            <p className="text-xs text-blue-600 font-medium">Secondary binding verification for hardware safety</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-100 leading-relaxed font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Key 1: Email Address */}
            <div className="space-y-1">
              <label htmlFor="email-input" className="block text-xs font-bold text-blue-800 uppercase tracking-wider">
                1. Account Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  placeholder="parent@guardian.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-blue-200 rounded-lg text-sm text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Key 2: Chip ID */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="chip-input" className="block text-xs font-bold text-blue-800 uppercase tracking-wider">
                  2. Registered Chip ID
                </label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-blue-400 cursor-help" />
                  <div className="pointer-events-none absolute bottom-full right-0 mb-1 w-48 p-2 bg-blue-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition duration-150 leading-relaxed z-10">
                    Acts as secondary authentication binding your session to the child's active GPS hardware chip.
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <input
                  id="chip-input"
                  type="text"
                  placeholder="CHIP-XXXX"
                  value={chipId}
                  onChange={(e) => setChipId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-blue-200 rounded-lg text-sm font-mono text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase"
                  required
                />
              </div>
            </div>

            {/* Key 3: Password */}
            <div className="space-y-1">
              <label htmlFor="password-input" className="block text-xs font-bold text-blue-800 uppercase tracking-wider">
                3. Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-blue-200 rounded-lg text-sm text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Validating 3-Key Auth...</span>
                </>
              ) : (
                <span className="text-sm font-bold">Secure Sign In</span>
              )}
            </button>

          </form>

          {/* Quick Prefill helper container */}
          <div className="pt-4 border-t border-blue-50 bg-blue-50/50 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-800">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Access Panel</span>
            </div>
            <p className="text-[11px] text-blue-600 leading-normal font-medium">
              Click below to instantly pre-fill correct demo credentials for evaluation. This helps test 3-key authentication immediately without manual entry.
            </p>
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="w-full text-center py-1.5 border border-blue-200 hover:bg-white text-blue-700 text-xs font-bold rounded-lg transition duration-100"
            >
              Prefill Student Demo Account
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-50 py-4 px-6 text-center text-xs text-blue-500 bg-white">
        <p>Security Handshake Binding Model — Beacon Safety Systems</p>
      </footer>

    </div>
  );
}
