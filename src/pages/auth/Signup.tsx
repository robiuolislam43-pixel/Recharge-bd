import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Lock, Mail, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function UserSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('অ্যাকাউন্ট তৈরি সফল হয়েছে! অনুগ্রহ করে আপনার ইমেইল চেক করুন।');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error('অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে: ' + error.message);
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
      <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-2 rotate-3 hover:rotate-0 transition-transform duration-300">
            <UserPlus className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">নতুন অ্যাকাউন্ট</CardTitle>
            <p className="text-slate-500 font-medium">স্মার্ট রিচার্জ পরিবারের সদস্য হতে আজই যোগ দিন</p>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ইমেইল ঠিকানা</label>
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
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">পাসওয়ার্ড</label>
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
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                সাইন আপ করার মাধ্যমে আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতি মেনে নিচ্ছেন।
              </p>
            </div>

            <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl text-lg font-black shadow-xl shadow-slate-200 transition-all hover:-translate-y-1" disabled={loading}>
              {loading ? 'অপেক্ষা করুন...' : 'অ্যাকাউন্ট তৈরি করুন'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <Link to="/login" className="text-emerald-600 font-black hover:underline">
                লগইন করুন
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
