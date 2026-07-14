import React, { useState } from 'react';
import { UserProfile, ActivePage } from '../types';
import { Save, User, Mail, ShieldAlert, ArrowLeft, Lock, Check } from 'lucide-react';

interface ProfileSettingsProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onNavigate: (page: ActivePage) => void;
}

export default function ProfileSettings({ currentUser, onUpdateUser, onNavigate }: ProfileSettingsProps) {
  const [studentName, setStudentName] = useState(currentUser.studentName);
  const [fatherEmail, setFatherEmail] = useState(currentUser.fatherEmail);
  const [motherEmail, setMotherEmail] = useState(currentUser.motherEmail);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('password123'); // Preset demo pass
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    const updatedUser: UserProfile = {
      ...currentUser,
      studentName,
      fatherEmail,
      motherEmail,
      email
    };

    onUpdateUser(updatedUser);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white text-blue-900 flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-blue-50 py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Command Center</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
              Hardware: {currentUser.chipId}
            </span>
          </div>
        </div>
      </header>

      {/* Main Settings Grid */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Form Fields */}
          <div className="flex-1 space-y-6">
            
            <div>
              <h1 className="text-2xl font-black tracking-tight text-blue-900">Student Profile & Safety Contacts</h1>
              <p className="text-xs text-blue-600 font-medium">Configure primary stakeholders and alert delivery nodes</p>
            </div>

            {success && (
              <div className="bg-blue-50 text-blue-800 text-xs p-3.5 rounded-lg border border-blue-100 flex items-center space-x-2 font-bold animate-fade-in">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Configuration synchronized successfully to "Users" record.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Student Name */}
              <div className="space-y-1">
                <label htmlFor="student-name-input" className="block text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Student Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="student-name-input"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Primary Parent Account Email */}
              <div className="space-y-1">
                <label htmlFor="parent-email-input" className="block text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Primary Account Email (Parent)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="parent-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Emergency Contacts Block: Father & Mother (DUAL PERSISTENCE) */}
              <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/20 space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Dual-Parent Redundant Notification Routing</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="father-email-input" className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      Father's Email
                    </label>
                    <input
                      id="father-email-input"
                      type="email"
                      value={fatherEmail}
                      onChange={(e) => setFatherEmail(e.target.value)}
                      className="block w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="mother-email-input" className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      Mother's Email
                    </label>
                    <input
                      id="mother-email-input"
                      type="email"
                      value={motherEmail}
                      onChange={(e) => setMotherEmail(e.target.value)}
                      className="block w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="space-y-1">
                <label htmlFor="reset-pass-input" className="block text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Password Reset
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-pass-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-150 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Save Changes</span>
              </button>

            </form>

          </div>

          {/* Right Column: Security Information Card */}
          <div className="w-full md:w-80 space-y-4">
            
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">Security Insights</h3>
              <div className="space-y-2 text-xs text-blue-800 leading-relaxed font-medium">
                <p>
                  <strong>Data Redundancy Mechanism</strong>: Beacon operates with dual failover alert logic.
                </p>
                <p className="border-l-2 border-blue-300 pl-2 text-blue-700 italic">
                  "Having both parents' emails configured allows the system to send emergency notifications to both people simultaneously, safeguarding against single-device communication loss."
                </p>
                <p>
                  <strong>Data Synchronization</strong>: Saving updates triggers immediate updates to the User record bound under Chip ID <strong>{currentUser.chipId}</strong>, syncing alerts dynamically.
                </p>
              </div>
            </div>

            <div className="border border-blue-100 rounded-xl p-5 text-center bg-white space-y-2">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Hardware Integration Node</span>
              <p className="text-xs text-blue-800 font-semibold">Active Node: CHIP-7729</p>
              <p className="text-[11px] text-blue-600 leading-normal font-medium">
                This account is bound to transceiver hardware node emitting real-time satellite telemetry.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-blue-50 py-4 px-6 text-center text-xs text-blue-500 bg-white">
        <p>Security Settings Module — Beacon Systems</p>
      </footer>

    </div>
  );
}
