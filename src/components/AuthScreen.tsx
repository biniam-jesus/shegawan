import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Shield, Mail, Lock, Languages, Check, Sparkles, Database, KeySquare, AlertCircle, Info 
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { translations, Language } from "../lib/translations";
import { UserRole } from "../types";

interface AuthScreenProps {
  language: Language;
  onLanguageToggle: () => void;
  onAuthSuccess: (sessionUser: any, selectedRole: UserRole) => void;
}

export function AuthScreen({ language, onLanguageToggle, onAuthSuccess }: AuthScreenProps) {
  const t = translations[language];
  const isConfigured = isSupabaseConfigured();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Owner");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Guard on inputs
    if (!email || !email.includes("@")) {
      setErrorMsg(language === "am" ? "እባክዎን ትክክለኛ ኢሜይል ያስገቡ" : "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg(language === "am" ? "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት" : "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isConfigured && supabase) {
        if (isSignUp) {
          // Sign Up
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: role,
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            setSuccessMsg(
              language === "am"
                ? "የአካውንት ምዝገባ ተሳክቷል! በመለያው ለመግባት ኢሜይልዎን ያረጋግጡ ወይም ወዲያውኑ ይግቡ።"
                : "Account created successfully! Check your email for verification link or try signing in."
            );
            setIsSignUp(false);
          }
        } else {
          // Sign In
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data?.user) {
            const userRole: UserRole = data.user.user_metadata?.role || role;
            setSuccessMsg(t.authSuccessTitle);
            setTimeout(() => {
              onAuthSuccess(data.user, userRole);
            }, 800);
          }
        }
      } else {
        setErrorMsg(
          language === "am"
            ? "እባክዎን የSupabase አቅርቦት ያስቀምጡ። ግባት የSupabase እንጂ እንግዳ አይደለም."
            : "Please configure Supabase first. Login is only available through Supabase."
        );
      }
    } catch (err: any) {
      console.error("Auth process error:", err);
      setErrorMsg(err?.message || (language === "am" ? "ችግር ተከስቷል! እባክዎን እንደገና ይሞክሩ።" : "An authentication error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Decorative Blur Backdrops representing gourmet flame or ambient lights */}
      <div className="absolute -top-40 -left-45 w-96 h-96 rounded-full bg-gold-accent/5 blur-[120px]" />
      <div className="absolute -bottom-40 -right-45 w-96 h-96 rounded-full bg-red-500/5 blur-[120px]" />

      <div className="w-full max-w-md bg-card-bg border border-border-dark rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Superior Language and configuration status row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-semibold text-neutral-500">
            <Database className={`h-3.5 w-3.5 ${isConfigured ? "text-green-500" : "text-yellow-500 animate-pulse"}`} />
            {isConfigured ? t.authStatusConnected : t.authStatusOffline}
          </div>
          
          <button
            id="auth-lang-toggle"
            type="button"
            onClick={onLanguageToggle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-gold-accent hover:text-white hover:bg-border-light border border-border-dark transition-all cursor-pointer"
          >
            <Languages className="h-3.5 w-3.5" />
            {language === "en" ? "Translate to አማርኛ" : "Switch to English"}
          </button>
        </div>

        {/* Brand visual header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gold-accent/10 border border-gold-accent/25 flex items-center justify-center text-gold-accent mb-3">
            <Shield className="h-6 w-6 stroke-[1.5]" />
          </div>
          <h1 className="text-2.5xl font-light tracking-wide text-neutral-100 font-serif">
            {t.appName} <span className="text-gold-accent font-medium italic">{t.appSubName}</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-2 font-light">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Database Status Feedback alert block */}
        {!isConfigured && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-950/20 border border-yellow-600/20 text-yellow-300 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[11px] font-mono">
                {language === "am" ? "የመጋዘን ዳታቤዝ ከመስመር ውጪ" : "Database Connection Off-Grid"}
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed font-light">
              {language === "am"
                ? "እባክዎን የSupabase እቅድ ያስቀምጡ እና ከዚያ በኋላ ይግቡ። ግባት ከSupabase ብቻ ይሁን።"
                : "Please configure Supabase first and then sign in. Authentication is available only through Supabase."}
            </p>
          </div>
        )}

        {/* User alerts (Error or success) */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl bg-red-950/25 border border-red-500/25 text-red-300 flex items-start gap-2.5 text-xs font-mono"
          >
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-red-400">{t.authErrorTitle}</span>
              <span>{errorMsg}</span>
            </div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl bg-green-950/25 border border-green-500/25 text-green-300 flex items-start gap-2.5 text-xs font-mono"
          >
            <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-green-400">{t.authSuccessTitle}</span>
              <span>{successMsg}</span>
            </div>
          </motion.div>
        )}

        {/* Main interactive login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-widest mb-1.5">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@epicurean-rest.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-input-bg border border-border-dark rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-gold-accent transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-widest mb-1.5">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-input-bg border border-border-dark rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-gold-accent transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>

          {/* Secure ERP Role choice card during registration / sign in */}
          <div className="p-4 rounded-xl border border-border-dark bg-[#171719]/40 space-y-2">
            <label className="block text-[11px] font-mono font-semibold text-gold-accent uppercase tracking-widest">
              💼 {t.authRoleRequired}
            </label>
            <p className="text-[10px] text-neutral-500 font-light leading-relaxed">
              {t.roleSelectDesc}
            </p>
            <div className="relative">
              <select
                id="auth-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full py-2 px-3 bg-card-bg border border-border-dark rounded-lg text-xs font-semibold text-neutral-300 focus:outline-none focus:border-gold-accent cursor-pointer"
              >
                <option value="Owner">{t.roleOwner}</option>
                <option value="Manager">{t.roleManager}</option>
                <option value="Store Keeper">{t.roleStoreKeeper}</option>
                <option value="Accountant">{t.roleAccountant}</option>
                <option value="Staff">{t.roleStaff}</option>
              </select>
            </div>
          </div>

          {/* Master Submit button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={!isConfigured || loading}
            className="w-full py-3 bg-gold-accent hover:bg-gold-accent/90 text-dark-bg font-bold rounded-xl text-sm shadow-lg shadow-gold-accent/15 cursor-pointer flex items-center justify-center gap-2 tracking-wide uppercase transition-all"
          >
            {loading ? (
              <span>{t.loading}</span>
            ) : (
              <>
                <KeySquare className="h-4 w-4" />
                {isSignUp ? t.signupButton : t.loginButton}
              </>
            )}
          </button>
        </form>

        {/* Signup switcher anchor */}
        <div className="text-center mt-5 text-xs pt-4 border-t border-border-light text-neutral-400">
          <span>{isSignUp ? t.haveAccount : t.noAccount} </span>
          <button
            id="auth-switch-mode-btn"
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-gold-accent font-semibold hover:underline cursor-pointer"
          >
            {isSignUp ? t.loginButton : t.signupButton}
          </button>
        </div>

      </div>
    </div>
  );
}
