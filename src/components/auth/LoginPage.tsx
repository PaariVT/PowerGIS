// ============================================================================
// POWERGIS ENTERPRISE ELECTRICITY DISTRIBUTION GIS PLATFORM
// DEDICATED ENTERPRISE LOGIN PAGE - VIBRANT AESTHETIC & PROFESSIONAL PORTAL
// Centered colorful sign-in card with integrated PowerGIS branding and
// role-colored demo sandbox.
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialUsers } from '../../data/simulatorData';
import { assetService } from '../../services/assetService';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types/auth';
import { LABELS, validateEmail } from '../../commons';
import { isSupabaseConfigured } from '../../lib/supabase';
import { isSimulatorRuntimeAllowed } from '../../repositories/repositoryFactory';
import {
  Zap,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldCheck,
  MapPin,
  Cpu,
  Sparkles,
  Layers,
  Lock,
  Globe2,
  Users,
} from 'lucide-react';

interface RoleColorPalette {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardAccent: string;
  avatarBg: string;
  buttonGradient: string;
  glowColor: string;
  categoryLabel: string;
}

const getRolePalette = (role: string): RoleColorPalette => {
  switch (role) {
    case 'super_admin':
    case 'ce':
    case 'se':
      return {
        badgeBg: 'bg-indigo-500/15',
        badgeText: 'text-indigo-300',
        badgeBorder: 'border-indigo-400/30',
        cardAccent: 'from-indigo-500 via-violet-500 to-purple-500',
        avatarBg: 'from-indigo-600 to-violet-600',
        buttonGradient: 'from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500',
        glowColor: 'hover:border-indigo-400/50',
        categoryLabel: 'Executive & Command',
      };
    case 'ee':
    case 'aee':
      return {
        badgeBg: 'bg-sky-500/15',
        badgeText: 'text-sky-300',
        badgeBorder: 'border-sky-400/30',
        cardAccent: 'from-sky-400 via-blue-500 to-cyan-400',
        avatarBg: 'from-sky-500 to-blue-600',
        buttonGradient: 'from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500',
        glowColor: 'hover:border-sky-400/50',
        categoryLabel: 'Division Engineering',
      };
    case 'ae':
    case 'je':
      return {
        badgeBg: 'bg-emerald-500/15',
        badgeText: 'text-emerald-300',
        badgeBorder: 'border-emerald-400/30',
        cardAccent: 'from-emerald-400 via-teal-500 to-cyan-500',
        avatarBg: 'from-emerald-500 to-teal-600',
        buttonGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
        glowColor: 'hover:border-emerald-400/50',
        categoryLabel: 'Field O&M Section',
      };
    case 'contractor':
      return {
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-400/30',
        cardAccent: 'from-amber-400 via-orange-500 to-yellow-500',
        avatarBg: 'from-amber-500 to-orange-600',
        buttonGradient: 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500',
        glowColor: 'hover:border-amber-400/50',
        categoryLabel: 'GPS Field Survey',
      };
    default:
      return {
        badgeBg: 'bg-rose-500/15',
        badgeText: 'text-rose-300',
        badgeBorder: 'border-rose-400/30',
        cardAccent: 'from-rose-500 via-pink-500 to-fuchsia-500',
        avatarBg: 'from-rose-500 to-pink-600',
        buttonGradient: 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500',
        glowColor: 'hover:border-rose-400/50',
        categoryLabel: 'Statutory Audit',
      };
  }
};

export const LoginPage: React.FC = () => {
  const { login, loginAsPersona, passwordRecovery, updatePassword } = useAuth();

  // Route between View 1 (Sign In) and View 2 (Demo Personas Sandbox)
  const [currentView, setCurrentView] = useState<'login' | 'demo'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation States for Login
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Demo Page filter and search state
  const [demoSearch, setDemoSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Forgot password modal state & validation
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotTouched, setForgotTouched] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordUpdateMsg, setPasswordUpdateMsg] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    if (identifierTouched) {
      setIdentifierError(validateEmail(val));
    }
    if (error) setError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordTouched) {
      setPasswordError(!val ? 'Password is required.' : null);
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierTouched(true);
    setPasswordTouched(true);

    const idErr = validateEmail(identifier);
    const passErr = !password ? 'Password is required.' : null;
    setIdentifierError(idErr);
    setPasswordError(passErr);

    if (idErr || passErr) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify statutory credentials.');
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Authentication error occurred during statutory verification.');
    }
  };

  // 1-Click Login from Demo Sandbox: sets simulator mode ON and logs in immediately
  const handleOneClickLogin = (u: UserProfile) => {
    const allowDemo = isSimulatorRuntimeAllowed() && !isSupabaseConfigured;
    if (!allowDemo) {
      setError('Demo sign-in is available only in development builds without a configured production backend. Use your authorized PowerGIS account to sign in.');
      setCurrentView('login');
      return;
    }
    setIsLoading(true);
    assetService.setSimulatorMode(true);
    setTimeout(() => {
      loginAsPersona(u.id);
      setIsLoading(false);
    }, 250);
  };

  const handleOpenForgotModal = () => {
    setForgotInput(identifier.includes('@') ? identifier.trim() : '');
    setForgotError(null);
    setForgotTouched(false);
    setForgotFeedback(null);
    setShowForgotModal(true);
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    setForgotError(null);
    setForgotTouched(false);
    setForgotFeedback(null);
    setForgotInput('');
  };

  const handleForgotInputChange = (val: string) => {
    setForgotInput(val);
    if (forgotTouched) {
      setForgotError(validateEmail(val));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotTouched(true);

    const err = validateEmail(forgotInput);
    setForgotError(err);
    if (err) return;

    setForgotFeedback('Requesting password reset…');
    try {
      const result = await authService.requestSupabasePasswordReset(forgotInput);
      if (!result.success) {
        setForgotError(result.message);
        setForgotFeedback(null);
        return;
      }
      setForgotFeedback(result.message);
    } catch (resetError: unknown) {
      setForgotError(resetError instanceof Error ? resetError.message : 'Unable to request password reset.');
      setForgotFeedback(null);
    }
  };

  // Filtered personas for Demo Page
  const filteredPersonas = initialUsers.filter(u => {
    if (selectedRoleFilter !== 'ALL') {
      if (selectedRoleFilter === 'EXEC' && !['super_admin', 'ce', 'se'].includes(u.role)) return false;
      if (selectedRoleFilter === 'ENG' && !['ee', 'aee'].includes(u.role)) return false;
      if (selectedRoleFilter === 'FIELD' && !['ae', 'je'].includes(u.role)) return false;
      if (selectedRoleFilter === 'EXT' && !['contractor', 'auditor'].includes(u.role)) return false;
    }
    if (!demoSearch.trim()) return true;
    const q = demoSearch.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.designation.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const quickPersonas = initialUsers.slice(0, 4);

  if (passwordRecovery) {
    return (
      <div className="pg-login-portal min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        <div className="pg-login-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="relative z-10 w-full max-w-[460px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-full mb-6" />
          <div className="flex items-center space-x-3.5 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/25">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">Set new PowerGIS password</h1>
              <p className="text-xs text-slate-500">Use a strong password. It will be stored only by Supabase Auth.</p>
            </div>
          </div>
          <div className="space-y-3.5">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (12+ characters)"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
            />
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={e => setNewPasswordConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
            />
            {passwordUpdateMsg && (
              <div className="text-xs p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                {passwordUpdateMsg}
              </div>
            )}
            <button
              onClick={async () => {
                if (newPassword.length < 12) {
                  setPasswordUpdateMsg('Password must be at least 12 characters.');
                  return;
                }
                if (newPassword !== newPasswordConfirm) {
                  setPasswordUpdateMsg('Passwords do not match.');
                  return;
                }
                const result = await updatePassword(newPassword);
                setPasswordUpdateMsg(result.message);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
            >
              Update password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pg-login-portal min-h-screen w-full text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Ambient Glowing Orbs & GIS Grid Overlay */}
      <div className="pg-login-grid-overlay absolute inset-0 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* View Router */}
      {currentView === 'login' || !isSimulatorRuntimeAllowed() || isSupabaseConfigured ? (
        /* ====================================================================
           PAGE 1: CENTERED COLORFUL & PROFESSIONAL ENTERPRISE LOGIN CARD
           ==================================================================== */
        <div className="relative z-10 w-full max-w-[460px] rounded-3xl overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)] border border-white/20 bg-white p-6 sm:p-8">
          {/* Vibrant Top Accent Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

          {/* Integrated PowerGIS Branding Header */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-200/80 mt-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/25 flex-shrink-0">
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    {LABELS.header.brandName}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {LABELS.header.brandSubtitle}
                </p>
              </div>
            </div>

            {/* Development-only demo entry point */}
            {isSimulatorRuntimeAllowed() && !isSupabaseConfigured && <button
              type="button"
              onClick={() => setCurrentView('demo')}
              title="Open the PowerGIS demo workspace"
              aria-label="Open demo workspace"
              className="inline-flex min-h-9 items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 hover:from-amber-500/25 hover:to-rose-500/25 text-amber-900 border border-amber-400/50 text-xs font-bold transition-all cursor-pointer flex-shrink-0 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" aria-hidden="true" />
              <span>Demo</span>
            </button>}
          </div>

          {/* Sign-In Title */}
          <div className="mb-5">
            <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full mb-2">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>Zero-Trust Gateway</span>
            </span>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {LABELS.auth.loginHeading}
            </h1>
          </div>

          {/* Backend configuration notice */}
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-300/80 text-amber-950 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center space-x-1.5 text-amber-900">
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  <span>Backend not configured</span>
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                  {isSimulatorRuntimeAllowed() ? 'Development Simulator' : 'Backend Required'}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-amber-800/90 leading-snug">
                A deployment administrator must configure the public Supabase URL and publishable key through the deployment environment, then rebuild the application.
                {isSimulatorRuntimeAllowed()
                  ? ' Development simulator mode is available in this build.'
                  : ' Demo identities are disabled in production. Configure the backend before deployment.'}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-900 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 leading-snug font-medium">{error}</div>
            </div>
          )}

          {/* Official Credentials Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {LABELS.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  value={identifier}
                  onChange={e => handleIdentifierChange(e.target.value)}
                  onBlur={() => {
                    setIdentifierTouched(true);
                    setIdentifierError(validateEmail(identifier));
                  }}
                  placeholder={LABELS.auth.emailPlaceholder}
                  className={`w-full bg-slate-50/70 focus:bg-white border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    identifierError && identifierTouched
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                />
              </div>
              {identifierError && identifierTouched && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center space-x-1">
                  <span>{identifierError}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {LABELS.auth.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-xs font-semibold text-blue-600 hover:text-indigo-700 underline transition-colors cursor-pointer"
                >
                  {LABELS.auth.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-indigo-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  onBlur={() => {
                    setPasswordTouched(true);
                    setPasswordError(!password ? 'Password is required.' : null);
                  }}
                  placeholder={LABELS.auth.passwordPlaceholder}
                  className={`w-full bg-slate-50/70 focus:bg-white border rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    passwordError && passwordTouched
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && passwordTouched && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center space-x-1">
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enter Operations Workspace</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Development-only simulator launchpad */}
          {isSimulatorRuntimeAllowed() && !isSupabaseConfigured && <div className="mt-6 pt-5 border-t border-slate-200/80">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-md">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </span>
                  <span className="text-xs font-bold text-white">1-Click Role Simulator</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('demo')}
                  className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center space-x-1 cursor-pointer"
                >
                  <span>All {initialUsers.length} Personas</span>
                  <ArrowRight className="w-3 h-3 text-cyan-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickPersonas.map(u => {
                  const palette = getRolePalette(u.role);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleOneClickLogin(u)}
                      disabled={isLoading}
                      className="text-left p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-cyan-400/40 transition-all flex items-center justify-between group cursor-pointer"
                      title={`1-Click Sign In as ${u.fullName} (${u.designation})`}
                    >
                      <div className="min-w-0 pr-1">
                        <div className={`text-[10px] font-extrabold uppercase ${palette.badgeText}`}>
                          {u.role.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] font-semibold text-white truncate">
                          {u.fullName}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>}
        </div>
      ) : (
        /* ====================================================================
           PAGE 2: DEDICATED COLORFUL DEMO PERSONAS & SIMULATION SANDBOX
           ==================================================================== */
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-8 text-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)]">
          {/* Top Return Bar with Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center font-bold text-xs shadow-lg shadow-amber-500/20 flex-shrink-0">
                <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    {LABELS.header.brandName}
                  </span>
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Simulation Sandbox Mode</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Explore role-scoped dashboards, GIS layers, and statutory workflows with 1-click sign-in
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-300" />
                <span>{LABELS.auth.backToLogin}</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 bg-slate-950/60 p-3.5 rounded-2xl border border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: `All Personas (${initialUsers.length})`, icon: Users },
                { id: 'EXEC', label: 'Executive & Admin', icon: ShieldCheck },
                { id: 'ENG', label: 'Division Engineering', icon: Layers },
                { id: 'FIELD', label: 'Section & Ward O&M', icon: MapPin },
                { id: 'EXT', label: 'Survey & Audit', icon: Globe2 },
              ].map(tab => {
                const Icon = tab.icon;
                const active = selectedRoleFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedRoleFilter(tab.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/25 border border-cyan-400/40'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={demoSearch}
                onChange={e => setDemoSearch(e.target.value)}
                placeholder="Search role, name, or jurisdiction..."
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Persona Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filteredPersonas.map(u => {
              const palette = getRolePalette(u.role);
              const initials = u.fullName
                .replace(/^Er\.\s+|^Dr\.\s+|^Thiru\.\s+/i, '')
                .split(' ')
                .map(part => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={u.id}
                  className={`relative overflow-hidden bg-slate-950/75 border border-white/10 ${palette.glowColor} rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-lg`}
                >
                  {/* Top Role Color Accent Strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${palette.cardAccent}`} />

                  <div>
                    {/* Header: Role badge and category */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${palette.badgeBg} ${palette.badgeText} ${palette.badgeBorder}`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 truncate max-w-[175px]" title={u.email}>
                        {u.email}
                      </span>
                    </div>

                    {/* Person Details with Colorful Avatar */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${palette.avatarBg} text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-md`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white leading-snug truncate">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                          {u.designation}
                        </div>
                      </div>
                    </div>

                    {/* Territorial Jurisdiction Scope */}
                    <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Jurisdiction Scope:</span>
                      <span className="text-cyan-300 font-semibold">
                        {u.regionId === 'reg-pdy' ? 'Puducherry' : u.regionId === 'reg-kkl' ? 'Karaikal' : 'State-Wide'}
                        {u.divisionId ? ` › ${u.divisionId.toUpperCase()}` : ''}
                        {u.sectionId ? ` › ${u.sectionId.toUpperCase()}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleOneClickLogin(u)}
                      disabled={isLoading}
                      className={`w-full py-2 px-3.5 rounded-xl bg-gradient-to-r ${palette.buttonGradient} text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shadow-md`}
                      title="Sign in as this user"
                    >
                      <Zap className="w-3.5 h-3.5 text-white fill-white" />
                      <span>{LABELS.auth.oneClickLogin} as {u.role.toUpperCase().replace('_', ' ')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPersonas.length === 0 && (
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-8 text-center text-slate-300 text-xs mb-4">
              No roles matched your query &lsquo;{demoSearch}&rsquo;.
            </div>
          )}
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2.5 mt-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-blue-600" />
              </div>
              <span>{LABELS.auth.resetPasswordTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
              {LABELS.auth.resetPasswordInstructionsLine1}
              <br />
              {LABELS.auth.resetPasswordInstructionsLine2}
            </p>

            {forgotFeedback ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                <div className="leading-relaxed">
                  {forgotFeedback.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {LABELS.auth.emailLabel}
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={forgotInput}
                    onChange={e => handleForgotInputChange(e.target.value)}
                    onBlur={() => {
                      setForgotTouched(true);
                      setForgotError(validateEmail(forgotInput));
                    }}
                    placeholder={LABELS.auth.emailPlaceholder}
                    className={`w-full bg-slate-50 focus:bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                      forgotError && forgotTouched
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-200'
                    }`}
                  />
                  {forgotError && forgotTouched && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center space-x-1">
                      <span>{forgotError}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseForgotModal}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    {LABELS.auth.resetPasswordButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
