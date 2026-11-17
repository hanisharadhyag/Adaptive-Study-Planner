import React, { useState } from 'react';
import { LogOut, UserCheck, X } from 'lucide-react';
import { StudentProfile } from '../types/study';
import { STUDENT_AVATAR_URL } from '../data/seedData';

interface AuthModalProps {
  isOpen: boolean;
  student: StudentProfile;
  onClose: () => void;
  onUpdateStudent: (next: StudentProfile) => void;
}

export function AuthModal({
  isOpen,
  student,
  onClose,
  onUpdateStudent,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [major, setMajor] = useState(student.major);
  const [year, setYear] = useState(student.year);
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid university email address.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setError(null);
    onUpdateStudent({
      name: mode === 'register' ? name.trim() : student.name || 'Alex Rivera',
      email: email.trim(),
      major: major.trim() || 'Computer Science',
      year: year.trim() || 'Junior Year',
      avatarUrl: student.avatarUrl || STUDENT_AVATAR_URL,
      isSignedIn: true,
    });
    onClose();
  };

  const handleSignOut = () => {
    onUpdateStudent({
      ...student,
      isSignedIn: false,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="auth-modal-title" className="text-base font-semibold text-slate-900">
              {student.isSignedIn ? 'Student Account' : 'Sign In to Study Planner'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Client-side authentication flow preview (persisted locally)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Segmented mode switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {student.isSignedIn && (
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {student.major} · {student.year}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Major
                    </label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Class Standing
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="Junior Year"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@university.edu"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5" />
                {mode === 'login' ? 'Sign In & Sync' : 'Create Student Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
