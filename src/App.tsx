/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";
import { LogIn, UserPlus, LogOut, Mail, Lock, Loader2, User } from "lucide-react";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center overflow-hidden">
        <motion.div
          key="intro"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <img
            src="https://i.ibb.co/84TCyPNf/logo.png"
            alt="Lamonte Logo"
            className="max-w-[80vw] h-auto"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-serif">
      <AnimatePresence mode="wait">
        {!session ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-xl p-8 border border-[#e5e5e0]">
              <div className="text-center mb-8">
                <img
                  src="https://i.ibb.co/84TCyPNf/logo.png"
                  alt="Lamonte Logo"
                  className="h-16 mx-auto mb-4"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-3xl font-bold text-[#A65E3E]">
                  {authMode === 'signin' ? 'Welcome Back' : 'Join Lamonte'}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  {authMode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-[#A65E3E] hover:bg-[#8d4f34] text-white rounded-2xl font-bold shadow-lg shadow-[#A65E3E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {authLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : authMode === 'signin' ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Sign Up
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e5e5e0]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-400 tracking-widest font-bold">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-4 bg-white border border-[#e5e5e0] hover:bg-[#f9f9f7] text-[#1a1a1a] rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-gray-500 hover:text-[#A65E3E] transition-colors"
                >
                  {authMode === 'signin' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            <nav className="bg-white border-b border-[#e5e5e0] px-6 py-4 flex items-center justify-between">
              <img
                src="https://i.ibb.co/84TCyPNf/logo.png"
                alt="Lamonte Logo"
                className="h-10"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#f9f9f7] rounded-full text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {session.user.user_metadata?.full_name || session.user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </nav>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
              <div className="mb-12">
                <h1 className="text-5xl font-bold text-[#A65E3E] mb-4">
                  Welco to Lamonte
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl">
                  Experience the finest flavors and a warm atmosphere at our restaurant & cafe.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Our Menu", desc: "Explore our curated selection of dishes.", icon: "🍽️" },
                  { title: "Reservations", desc: "Book your table for an unforgettable evening.", icon: "📅" },
                  { title: "Special Events", desc: "Join us for live music and seasonal celebrations.", icon: "✨" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[32px] border border-[#e5e5e0] shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
