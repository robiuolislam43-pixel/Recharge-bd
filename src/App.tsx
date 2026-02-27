import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Smartphone, History as HistoryIcon, ShieldAlert, LogIn, UserPlus, LogOut, User, Activity as ActivityIcon, DollarSign } from 'lucide-react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';

import Home from './pages/Home';
import Payment from './pages/Payment';
import OrderHistory from './pages/History';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UserLogin from './pages/auth/Login';
import UserSignup from './pages/auth/Signup';
import SplashScreen from './components/SplashScreen';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.error('Session fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Smartphone className="h-6 w-6 text-emerald-400 relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter text-slate-900 leading-none">সহজ রিচার্জ</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Fast & Secure</span>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
              <Link to="/" className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all">হোম</Link>
              <Link to="/history" className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all">অর্ডার হিস্ট্রি</Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 bg-white p-1.5 pr-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                      <User className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">প্রেমিয়াম মেম্বার</span>
                      <span className="text-xs font-black text-slate-900 leading-none mt-1">{user.email.split('@')[0]}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-100 mx-1" />
                    <button 
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="লগআউট"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                    লগইন
                  </Link>
                  <Link to="/signup" className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black hover:-translate-y-1 transition-all">
                    সাইন আপ
                  </Link>
                </div>
              )}
              <Link
                to="/admin"
                className="w-12 h-12 bg-white border border-slate-100 hover:border-emerald-500/50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl flex items-center justify-center transition-all shadow-sm"
                title="অ্যাডমিন পোর্টাল"
              >
                <ShieldAlert className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-2xl tracking-tighter leading-none">সহজ রিচার্জ</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mt-1">Shohoj Recharge</span>
                </div>
              </div>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                সহজ রিচার্জ - বাংলাদেশের সব অপারেটরের জন্য দ্রুত এবং নিরাপদ মোবাইল রিচার্জ সেবা।
              </p>
              <div className="flex gap-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center">
                    <ActivityIcon className="w-5 h-5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">দ্রুত লিঙ্ক</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><Link to="/" className="hover:text-white transition-colors">হোম পেজ</Link></li>
                <li><Link to="/history" className="hover:text-white transition-colors">অর্ডার হিস্ট্রি</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">ইউজার লগইন</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">অ্যাডমিন প্যানেল</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">সহযোগিতা</h4>
              <p className="text-sm font-bold text-slate-400 leading-relaxed">যেকোনো সমস্যায় আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>
              <div className="pt-4">
                <Button 
                  onClick={() => window.open('https://wa.me/8801924830869', '_blank')}
                  className="w-full bg-white text-slate-900 hover:bg-emerald-500 hover:text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest transition-all"
                >
                  যোগাযোগ করুন
                </Button>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} সহজ রিচার্জ বিডি। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Link to="#" className="hover:text-white transition-colors">শর্তাবলী</Link>
              <Link to="#" className="hover:text-white transition-colors">গোপনীয়তা নীতি</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'rounded-2xl font-sans font-semibold text-sm',
          style: {
            padding: '16px 24px',
          }
        }}
      />
      
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/signup" element={<UserSignup />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        )}
      </AnimatePresence>
    </Router>
  );
}
