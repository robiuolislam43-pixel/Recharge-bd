import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Lock, Mail, LogIn, ArrowRight, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function UserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('লগইন সফল হয়েছে!');
        // Small delay to ensure session is saved in storage
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    } catch (error: any) {
      toast.error('লগইন ব্যর্থ হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[80vh] flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardHeader className="text-center space-y-4 pt-10 px-6 sm:px-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xl sm:text-2xl tracking-tighter leading-none text-slate-900">সহজ রিচার্জ</span>
              <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-1">Shohoj Recharge</span>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">লগইন করুন</CardTitle>
            <p className="text-sm sm:text-base text-slate-500 font-medium">আপনার অ্যাকাউন্টে প্রবেশ করে রিচার্জ শুরু করুন</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-10 pt-4 sm:pt-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">ইমেইল ঠিকানা</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-emerald-500 rounded-2xl transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">পাসওয়ার্ড</label>
                <Link to="#" className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-emerald-500 rounded-2xl transition-all"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl text-lg font-black shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1" disabled={loading}>
              {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              অ্যাকাউন্ট নেই?{' '}
              <Link to="/signup" className="text-emerald-600 font-black hover:underline">
                নতুন অ্যাকাউন্ট খুলুন
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
